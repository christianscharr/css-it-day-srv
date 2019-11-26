interface ResponseCnt<T> {
  body?: T;
  success: boolean;
  statusCode: number;
  statusText: string;
}

export { ResponseCnt };
