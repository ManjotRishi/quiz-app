import React from 'react';
import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PostLikeIcon } from '../icons/AppShellIcons';
import { styles } from './homeStyles';
import { SpotlightPost } from './homeTypes';
import { buildAvatarInitials } from './homeUtils';

type PostPreviewModalProps = {
  post: SpotlightPost | null;
  visible: boolean;
  onClose: () => void;
  onOpenFeed: () => void;
};

const ColorfulCloseGlyph = () => (
  <View style={styles.colorfulCloseGlyph}>
    <LinearGradient
      colors={['#FACC15', '#FB923C', '#F43F5E']}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={[styles.colorfulCloseStroke, styles.colorfulCloseStrokeForward]}
    />
    <LinearGradient
      colors={['#38BDF8', '#22C55E', '#FACC15']}
      end={{ x: 1, y: 1 }}
      start={{ x: 0, y: 0 }}
      style={[styles.colorfulCloseStroke, styles.colorfulCloseStrokeBackward]}
    />
  </View>
);

const PostPreviewModal = ({ post, visible, onClose, onOpenFeed }: PostPreviewModalProps) => {
  const spotlightInitials = buildAvatarInitials(post?.authorName ?? '');

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.spotlightModalRoot}>
        <TouchableOpacity activeOpacity={1} style={styles.spotlightModalBackdrop} onPress={onClose} />

        <SafeAreaView style={styles.spotlightModalCard}>
          <LinearGradient
            colors={['rgba(6,18,28,0.99)', 'rgba(11,30,44,0.99)', 'rgba(18,45,58,0.99)']}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.spotlightModalGradient}
          >
            <View style={styles.spotlightModalGlowOne} />
            <View style={styles.spotlightModalGlowTwo} />

            <View style={styles.spotlightModalHeader}>
              <View style={styles.spotlightModalHeaderCopy}>
                <Text style={styles.spotlightModalTitle}>Post preview</Text>
              </View>

              <TouchableOpacity activeOpacity={0.88} onPress={onClose} style={styles.spotlightModalClose}>
                <ColorfulCloseGlyph />
              </TouchableOpacity>
            </View>

            {post ? (
              <>
                <View style={styles.spotlightPostAuthorRow}>
                  <LinearGradient
                    colors={['#FB923C', '#FACC15', '#38BDF8']}
                    end={{ x: 1, y: 1 }}
                    start={{ x: 0, y: 0 }}
                    style={styles.spotlightPostAvatar}
                  >
                    <Text style={styles.spotlightPostAvatarText}>{spotlightInitials}</Text>
                  </LinearGradient>

                  <View style={styles.spotlightPostMeta}>
                    <Text numberOfLines={1} style={styles.spotlightPostAuthorName}>{post.authorName}</Text>
                    <Text numberOfLines={1} style={styles.spotlightPostDate}>{post.createdAtLabel}</Text>
                  </View>

                  <View style={styles.spotlightPostLikePill}>
                    <PostLikeIcon color="#FFF7FB" filled size={14} />
                    <Text style={styles.spotlightPostLikeText}>{post.likeCount}</Text>
                  </View>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  style={styles.spotlightPostBodyScroll}
                  contentContainerStyle={styles.spotlightPostBodyScrollContent}
                >
                  <Text style={styles.spotlightPostBody}>{post.body}</Text>
                </ScrollView>

                <TouchableOpacity activeOpacity={0.9} onPress={onOpenFeed} style={styles.spotlightOpenFeedTouch}>
                  <LinearGradient
                    colors={['#14B8A6', '#38BDF8', '#FB923C']}
                    end={{ x: 1, y: 1 }}
                    start={{ x: 0, y: 0 }}
                    style={styles.spotlightOpenFeedButton}
                  >
                    <Text style={styles.spotlightOpenFeedText}>Open Posts Feed</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : null}
          </LinearGradient>
        </SafeAreaView>
      </View>
    </Modal>
  );
};

export default PostPreviewModal;
