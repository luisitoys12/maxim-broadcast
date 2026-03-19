// Maxim Broadcast - Android Build Configuration
// Copyright (c) 2026 EstacionKusMedia
// License: GNU GPL v2.0

plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.estacionkusmedia.maxim_broadcast"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.estacionkusmedia.maxim_broadcast"
        minSdk = 26 // Android 8.0+
        targetSdk = 34
        versionCode = 100 // 1.0.0
        versionName = "1.0.0"
        
        ndk {
            abiFilters += listOf("armeabi-v7a", "arm64-v8a", "x86_64")
        }

        externalNativeBuild {
            cmake {
                cppFlags += "-std=c++17"
                arguments += listOf(
                    "-DANDROID_STL=c++_shared",
                    "-DENABLE_BROWSER=OFF",
                    "-DMAXIM_BROADCAST=ON",
                    "-DENABLE_WEBSOCKET=ON"
                )
            }
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug") // Change for production
        }
    }

    externalNativeBuild {
        cmake {
            path = file("../../CMakeLists.txt")
            version = "3.22.1+"
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }

    buildFeatures {
        viewBinding = true
        compose = true
    }
}

dependencies {
    // AndroidX Core
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("androidx.constraintlayout:constraintlayout:2.1.4")
    implementation("com.google.android.material:material:1.11.0")
    
    // Jetpack Compose
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.activity:activity-compose:1.8.2")
    
    // Camera/Video
    implementation("androidx.camera:camera-core:1.3.1")
    implementation("androidx.camera:camera-camera2:1.3.1")
    implementation("androidx.camera:camera-lifecycle:1.3.1")
    implementation("androidx.camera:camera-view:1.3.1")
    
    // WebRTC for streaming
    implementation("io.getstream:stream-webrtc-android:1.1.1")
    
    // Networking
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("io.socket:socket.io-client:2.1.0")
    
    // Media processing
    implementation("com.arthenica:ffmpeg-kit-full:6.0-2")
    
    // ML/AI
    implementation("com.google.mlkit:face-detection:16.1.6")
    implementation("com.google.mlkit:text-recognition:16.0.0")
    
    // WebView for dashboard
    implementation("androidx.webkit:webkit:1.9.0")
}
