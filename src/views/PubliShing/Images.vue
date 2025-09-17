<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useImageStore } from '@/stores/publishing/AddImage';
import { useRouter } from 'vue-router';

const store = useImageStore();
const router = useRouter();
const preview = ref<string[]>([]);

// 컴포넌트 마운트 시 store에 있는 이미지 기반으로 preview 초기화
onMounted(() => {
  preview.value = [];
  store.images.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.value.push(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  });
});

const onFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files) return;

  // 최대 10개 파일만 허용
  Array.from(files)
    .slice(0, 10)
    .forEach((file) => {
      store.addImage(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        preview.value.push(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    });
};

const addImages = () => {
  if (store.images.length === 0) {
    alert('최소 한 개 이상의 이미지를 선택해주세요.');
    return;
  }
  // 페이지를 이동하지 않고, 이미지 등록이 완료되었음을 알립니다.
  alert('이미지 등록이 완료되었습니다!');
};

const removeImage = (index: number) => {
  store.removeImage(index);
  preview.value.splice(index, 1);
};
</script>

<template>
  <div class="image-container">
    <div class="image-card">
      <h1>호텔 이미지 추가</h1>
      <form class="image-form" @submit.prevent="addImages">
        <div class="form-group">
          <label for="image-upload">이미지 업로드</label>
          <input id="image-upload" type="file" @change="onFileChange" accept="image/*" multiple />
        </div>

        <ul v-if="preview.length" class="image-list">
          <li v-for="(img, index) in preview" :key="index">
            <img :src="img" alt="미리보기" />
            <button type="button" class="delete-btn" @click="removeImage(index)">삭제</button>
          </li>
        </ul>

        <div class="button-group">
          <button type="submit" class="submit-btn">이미지 등록</button>
          <button type="button" class="cancel-btn" @click="router.push('/HotelRegister')">
            뒤로가기
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f8f8f8;
  padding: 20px;
}

.image-card {
  background: #fff;
  width: 400px;
  max-width: 100%;
  border-radius: 10px;
  padding: 30px 20px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

h1 {
  text-align: center;
  margin-bottom: 25px;
  font-size: 24px;
  font-weight: bold;
  color: #333;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #555;
}

input[type='file'] {
  width: 100%;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  background: white;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.submit-btn {
  flex: 1;
  background: #4caf50;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  padding: 10px;
  cursor: pointer;
}

.cancel-btn {
  flex: 1;
  background: #f44336;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  padding: 10px;
  cursor: pointer;
}

.submit-btn:hover {
  background: #45a049;
}

.cancel-btn:hover {
  background: #e53935;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
  padding-left: 0;
  list-style: none;
}

.image-list li {
  position: relative;
  width: 80px;
  height: 80px;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}

.image-list li img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.delete-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(229, 57, 53, 0.8);
  color: white;
  font-size: 10px;
  font-weight: bold;
  border: none;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.delete-btn:hover {
  background: #c62828;
}
</style>
