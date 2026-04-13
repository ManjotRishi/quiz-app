if(NOT TARGET hermes-engine::hermesvm)
add_library(hermes-engine::hermesvm SHARED IMPORTED)
set_target_properties(hermes-engine::hermesvm PROPERTIES
    IMPORTED_LOCATION "C:/Users/Laptop/.gradle/caches/8.13/transforms/c090c08649e0076cc725aa9f1eb6d2b8/transformed/hermes-android-250829098.0.9-release/prefab/modules/hermesvm/libs/android.arm64-v8a/libhermesvm.so"
    INTERFACE_INCLUDE_DIRECTORIES "C:/Users/Laptop/.gradle/caches/8.13/transforms/c090c08649e0076cc725aa9f1eb6d2b8/transformed/hermes-android-250829098.0.9-release/prefab/modules/hermesvm/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()

