import { ref } from 'vue';
import { defineStore } from 'pinia';

/**
 * 이미지 등록 및 관리를 위한 Pinia 스토어
 */
export const useRegisterStore = defineStore('register', () => {

  /**
   * 상태 (State)
   * 업로드된 이미지들의 데이터 URL(Base64) 문자열을 저장하는 배열입니다.
   */
  const images = ref<string[]>([]);

  /**
   * 액션 (Actions)
   */

  /**
   * 이미지 배열에 새로운 이미지를 추가합니다.
   * @param {string} imageUrl - 추가할 이미지의 데이터 URL 문자열
   */
  function addImage(imageUrl: string) {
    images.value.push(imageUrl);
  }

  /**
   * 지정된 인덱스의 이미지를 배열에서 제거합니다.
   * @param {number} index - 제거할 이미지의 인덱스
   */
  function removeImage(index: number) {
    // 인덱스가 유효한 범위 내에 있는지 확인
    if (index > -1 && index < images.value.length) {
      images.value.splice(index, 1);
    }
  }


  return {
    images,
    addImage,
    removeImage,
  };
});
