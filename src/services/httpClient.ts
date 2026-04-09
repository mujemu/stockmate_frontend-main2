import axios from 'axios';
import { BASE_URL } from '../config/api';

/** 모든 API 호출은 이 인스턴스를 거치게 하면 베이스 URL·타임아웃·인터셉터를 한곳에서 관리할 수 있습니다. */
export const http = axios.create({
  baseURL: BASE_URL,
  timeout: 60_000,
});
