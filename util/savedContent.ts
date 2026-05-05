import firestore from '@react-native-firebase/firestore';
import { FAV_QUESTIONS, LISTING, NOTES } from './constants';
import { getDeviceScopeKey } from './deviceIdentity';

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_WEEKLY_ITEMS = 10;
const DEVICE_LISTINGS_FIELD = 'deviceListings';

export type SaveStatus = 'saved' | 'exists' | 'removed' | 'limit';

export type FavouriteQuestionRecord = {
  id: string;
  dedupeKey: string;
  quizTitle: string;
  source: string;
  questionText: string;
  answerText: string;
  options: string[];
  questionNumber?: number;
  totalQuestions?: number;
  createdAt: string;
};

export type FavouriteQuestionInput = {
  quizTitle?: string;
  source?: string;
  questionText: string;
  answerText: string;
  options?: string[];
  questionNumber?: number;
  totalQuestions?: number;
};

export type NoteRecord = {
  id: string;
  note: string;
  createdAt: string;
};

type SaveResult<T> = {
  status: SaveStatus;
  items: T[];
};

type ListingItem = {
  createdAt?: string;
  id?: string;
};

type DeviceScopedListing<T extends ListingItem> = {
  items?: T[];
  updatedAt?: string;
};

type ListingReadResult<T extends ListingItem> = {
  deviceKey: string;
  storedItems: T[];
};

const listingCache = new Map<string, ListingItem[]>();

const createId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const normalizeKeyPart = (value?: string) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9 -]/g, '');

const parseCreatedAt = (value?: string) => {
  if (!value) {
    return 0;
  }

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

const sortNewestFirst = <T extends ListingItem>(items: T[]) =>
  [...items].sort((left, right) => parseCreatedAt(right.createdAt) - parseCreatedAt(left.createdAt));

const pruneCurrentWeekItems = <T extends ListingItem>(items: T[]) => {
  const now = Date.now();

  return items.filter((item) => {
    const createdAt = parseCreatedAt(item.createdAt);

    if (!createdAt) {
      return false;
    }

    return now - createdAt < WEEK_IN_MS;
  });
};

const arraysDiffer = <T extends ListingItem>(left: T[], right: T[]) => {
  if (left.length !== right.length) {
    return true;
  }

  return left.some((item, index) => item.id !== right[index]?.id);
};

const getListingRef = (collectionName: string) =>
  firestore().collection(collectionName).doc(LISTING);

const getCacheKey = (collectionName: string, deviceKey: string) => `${collectionName}:${deviceKey}`;

const readCachedItems = <T extends ListingItem>(collectionName: string, deviceKey: string) => {
  const cachedItems = listingCache.get(getCacheKey(collectionName, deviceKey));

  if (!cachedItems) {
    return null;
  }

  return cachedItems as T[];
};

const writeCachedItems = <T extends ListingItem>(
  collectionName: string,
  deviceKey: string,
  items: T[]
) => {
  listingCache.set(getCacheKey(collectionName, deviceKey), items as ListingItem[]);
};

const readDeviceListing = async <T extends ListingItem>(
  collectionName: string
): Promise<ListingReadResult<T>> => {
  const deviceKey = getDeviceScopeKey();
  const cachedItems = readCachedItems<T>(collectionName, deviceKey);

  if (cachedItems) {
    return {
      deviceKey,
      storedItems: cachedItems,
    };
  }

  const snapshot = await getListingRef(collectionName).get();
  const data = snapshot?.data?.() ?? {};
  const rawDeviceListings =
    data?.[DEVICE_LISTINGS_FIELD] && typeof data[DEVICE_LISTINGS_FIELD] === 'object'
      ? data[DEVICE_LISTINGS_FIELD]
      : {};
  const deviceListings = rawDeviceListings as Record<string, DeviceScopedListing<T>>;
  const scopedItems = Array.isArray(deviceListings?.[deviceKey]?.items)
    ? (deviceListings[deviceKey].items as T[])
    : [];

  writeCachedItems(collectionName, deviceKey, scopedItems);

  return {
    deviceKey,
    storedItems: scopedItems,
  };
};

const writeDeviceListingItems = async <T extends ListingItem>(
  collectionName: string,
  deviceKey: string,
  items: T[]
) => {
  const updatedAt = new Date().toISOString();
  await getListingRef(collectionName).set(
    {
      [DEVICE_LISTINGS_FIELD]: {
        [deviceKey]: {
          items,
          updatedAt,
        },
      },
      updatedAt,
    },
    { merge: true }
  );

  writeCachedItems(collectionName, deviceKey, items);
};

const syncCurrentWeekListing = async <T extends ListingItem>(collectionName: string): Promise<T[]> => {
  const readResult = await readDeviceListing<T>(collectionName);
  const { deviceKey, storedItems } = readResult;
  const activeItems = sortNewestFirst(pruneCurrentWeekItems(storedItems));

  if (arraysDiffer(storedItems, activeItems)) {
    await writeDeviceListingItems(collectionName, deviceKey, activeItems);
  }

  return activeItems;
};

export const createFavouriteQuestionKey = ({
  questionText,
  answerText,
  quizTitle,
  source,
}: Pick<FavouriteQuestionInput, 'questionText' | 'answerText' | 'quizTitle' | 'source'>) =>
  [
    normalizeKeyPart(source),
    normalizeKeyPart(quizTitle),
    normalizeKeyPart(questionText),
    normalizeKeyPart(answerText),
  ].join('::');

export const getWeeklyFavouriteQuestions = async () =>
  syncCurrentWeekListing<FavouriteQuestionRecord>(FAV_QUESTIONS);

export const getWeeklyNotes = async () => syncCurrentWeekListing<NoteRecord>(NOTES);

export const toggleFavouriteQuestion = async (
  payload: FavouriteQuestionInput
): Promise<SaveResult<FavouriteQuestionRecord>> => {
  const readResult = await readDeviceListing<FavouriteQuestionRecord>(FAV_QUESTIONS);
  const { deviceKey, storedItems } = readResult;
  const activeItems = sortNewestFirst(pruneCurrentWeekItems(storedItems));
  const dedupeKey = createFavouriteQuestionKey(payload);
  const existingItem = activeItems.find((item) => item.dedupeKey === dedupeKey);

  if (existingItem) {
    const nextItems = activeItems.filter((item) => item.dedupeKey !== dedupeKey);
    await writeDeviceListingItems(FAV_QUESTIONS, deviceKey, nextItems);

    return {
      status: 'removed',
      items: nextItems,
    };
  }

  if (activeItems.length >= MAX_WEEKLY_ITEMS) {
    return {
      status: 'limit',
      items: activeItems,
    };
  }

  const nextItems = sortNewestFirst([
    {
      id: createId(),
      dedupeKey,
      quizTitle: payload.quizTitle?.trim() || 'Quiz Question',
      source: payload.source?.trim() || 'quiz',
      questionText: payload.questionText.trim(),
      answerText: payload.answerText.trim(),
      options: payload.options ?? [],
      questionNumber: payload.questionNumber,
      totalQuestions: payload.totalQuestions,
      createdAt: new Date().toISOString(),
    },
    ...activeItems,
  ]);

  await writeDeviceListingItems(FAV_QUESTIONS, deviceKey, nextItems);

  return {
    status: 'saved',
    items: nextItems,
  };
};

export const saveNote = async (note: string): Promise<SaveResult<NoteRecord>> => {
  const readResult = await readDeviceListing<NoteRecord>(NOTES);
  const { deviceKey, storedItems } = readResult;
  const activeItems = sortNewestFirst(pruneCurrentWeekItems(storedItems));

  if (activeItems.length >= MAX_WEEKLY_ITEMS) {
    return {
      status: 'limit',
      items: activeItems,
    };
  }

  const nextItems = sortNewestFirst([
    {
      id: createId(),
      note: note.trim(),
      createdAt: new Date().toISOString(),
    },
    ...activeItems,
  ]);

  await writeDeviceListingItems(NOTES, deviceKey, nextItems);

  return {
    status: 'saved',
    items: nextItems,
  };
};

export const deleteNote = async (noteId: string): Promise<NoteRecord[]> => {
  const readResult = await readDeviceListing<NoteRecord>(NOTES);
  const { deviceKey, storedItems } = readResult;
  const activeItems = sortNewestFirst(pruneCurrentWeekItems(storedItems));
  const nextItems = activeItems.filter((item) => item.id !== noteId);

  if (nextItems.length === activeItems.length) {
    return activeItems;
  }

  await writeDeviceListingItems(NOTES, deviceKey, nextItems);
  return nextItems;
};

export const deleteFavouriteQuestion = async (
  questionId: string
): Promise<FavouriteQuestionRecord[]> => {
  const readResult = await readDeviceListing<FavouriteQuestionRecord>(FAV_QUESTIONS);
  const { deviceKey, storedItems } = readResult;
  const activeItems = sortNewestFirst(pruneCurrentWeekItems(storedItems));
  const nextItems = activeItems.filter((item) => item.id !== questionId);

  if (nextItems.length === activeItems.length) {
    return activeItems;
  }

  await writeDeviceListingItems(FAV_QUESTIONS, deviceKey, nextItems);
  return nextItems;
};
