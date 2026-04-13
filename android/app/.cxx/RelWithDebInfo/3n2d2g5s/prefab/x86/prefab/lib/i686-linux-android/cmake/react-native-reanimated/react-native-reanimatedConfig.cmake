if(NOT TARGET react-native-reanimated::reanimated)
add_library(react-native-reanimated::reanimated SHARED IMPORTED)
set_target_properties(react-native-reanimated::reanimated PROPERTIES
    IMPORTED_LOCATION "D:/QUIZZ/quiz-app/node_modules/react-native-reanimated/android/build/intermediates/cxx/RelWithDebInfo/6p6r5i6c/obj/x86/libreanimated.so"
    INTERFACE_INCLUDE_DIRECTORIES "D:/QUIZZ/quiz-app/node_modules/react-native-reanimated/android/build/prefab-headers/reanimated"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

