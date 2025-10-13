<script setup lang="ts">
import { computed, ref } from 'vue'
import { Gravatar } from '@sauromates/vue-gravatar'

const props = withDefaults(defineProps<{
  email: string
  profileUrl?: string | null
  size?: number | string
  alt?: string
  rounded?: boolean
  imgClass?: string
  gravatarDefault?: 'identicon' | 'mp' | 'retro' | 'monsterid' | 'robohash' | 'wavatar' | 'blank' | '404'
  gravatarRating?: 'g' | 'pg' | 'r' | 'x'
}>(), {
  size: 80,
  alt: 'Profile image',
  rounded: true,
  gravatarDefault: 'identicon',
  gravatarRating: 'g'
})

const imgError = ref(false)
const showImage = computed(() => !!props.profileUrl && !imgError.value)
const numericSize = computed(() => typeof props.size === 'string' ? (parseInt(props.size, 10) || 40) : props.size)
const dimensionStyle = computed(() => {
  const s = typeof props.size === 'number' ? `${props.size}px` : (props.size || '40px')
  return { width: s, height: s }
})
const computedClass = computed(() => [props.rounded ? 'rounded-full' : 'rounded', 'object-cover', props.imgClass].filter(Boolean).join(' '))

// Gravatar 컴포넌트에서 템플릿 리터럴 타입의 이메일을 요구 → 안전 캐스팅
const typedEmail = computed(() => props.email.trim().toLowerCase() as `${string}@${string}.${string}`)

const onImgError = () => { imgError.value = true }
</script>

<template>
  <!-- 외부 프로필 이미지가 있으면 우선 사용. 로드 실패 시 Gravatar로 폴백 -->
  <img
    v-if="showImage"
    :src="profileUrl as string"
    :alt="alt"
    :width="numericSize"
    :height="numericSize"
    :style="dimensionStyle"
    :class="computedClass"
    class="w-12! h-12!"
    loading="lazy"
    decoding="async"
    referrerpolicy="no-referrer"
    @error="onImgError"
  />
  <Gravatar
    v-else
    :email="typedEmail"
    :size="numericSize"
    :default="gravatarDefault"
    :rating="gravatarRating"
    :alt="alt"
    :class="computedClass"
    class="w-12 h-12"
  />
</template>

<style scoped>
/* 필요한 경우 외형 커스터마이징 */
</style>
