export type Page<T> = {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: any[]; // 필요하면 정교하게 타입 정의 가능
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  first: boolean;
  size: number;
  number: number;
  sort: any[]; // 위와 동일
  numberOfElements: number;
  empty: boolean;
};
