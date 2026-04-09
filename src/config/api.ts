// 핸드폰(Expo Go): PC의 로컬 IP로 변경 (예: http://192.168.x.x:8000)
// 웹 브라우저: localhost 사용
// 배포·팀 공유: 루트에 .env 를 두고 EXPO_PUBLIC_API_BASE_URL=https://api.example.com (Expo는 EXPO_PUBLIC_ 만 번들에 포함)
const envBase =
  typeof process !== 'undefined' && process.env.EXPO_PUBLIC_API_BASE_URL
    ? process.env.EXPO_PUBLIC_API_BASE_URL
    : '';

export const BASE_URL = envBase || 'http://192.168.11.207:8000';
