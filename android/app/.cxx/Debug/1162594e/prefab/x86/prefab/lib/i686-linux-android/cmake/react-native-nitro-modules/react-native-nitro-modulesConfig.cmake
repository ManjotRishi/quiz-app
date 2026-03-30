if(NOT TARGET react-native-nitro-modules::NitroModules)
add_library(react-native-nitro-modules::NitroModules SHARED IMPORTED)
set_target_properties(react-native-nitro-modules::NitroModules PROPERTIES
    IMPORTED_LOCATION "/Users/manjotrishi/Documents/ReactNative/dailyQuizz/node_modules/react-native-nitro-modules/android/build/intermediates/cxx/Debug/613s3q5b/obj/x86/libNitroModules.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/manjotrishi/Documents/ReactNative/dailyQuizz/node_modules/react-native-nitro-modules/android/build/headers/nitromodules"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

