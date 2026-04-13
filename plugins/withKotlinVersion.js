/**
 * 커스텀 Expo Config Plugin
 * React Native 0.76 템플릿이 build.gradle에 kotlinVersion = "1.9.25"를 하드코딩하기 때문에
 * expo-build-properties의 kotlinVersion 설정이 무시됨.
 * 이 플러그인은 prebuild 후 생성된 build.gradle을 직접 패치하여 Kotlin 버전을 강제로 교체합니다.
 */
const { withProjectBuildGradle } = require('@expo/config-plugins');

const KOTLIN_VERSION = '2.1.21';

module.exports = function withKotlinVersion(config) {
  return withProjectBuildGradle(config, (config) => {
    const contents = config.modResults.contents;

    // kotlinVersion = "x.x.xx" 패턴을 모두 2.1.21로 교체
    if (contents.includes('kotlinVersion')) {
      config.modResults.contents = contents.replace(
        /kotlinVersion\s*=\s*["'][^"']*["']/g,
        `kotlinVersion = "${KOTLIN_VERSION}"`
      );
    }

    return config;
  });
};
