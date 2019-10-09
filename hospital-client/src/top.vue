<template>
  <div>
    <button @click="isCameraActive = true">カメラを開く</button>
    <qrcode-stream v-if="isCameraActive" @decode="onDecode"></qrcode-stream>
    <p>{{inputString}}</p>
    <button @click="console.log('test')">Upload(未実装)</button>
  </div>
</template>

<script>
import { QrcodeStream } from 'vue-qrcode-reader';
export default {
  data: function () {
    return {
      isCameraActive: false,
      inputString: ""
    }
  },
  components: {
    QrcodeStream
  },
  methods: {
  onDecode(inputString) {
    console.log(inputString);
    this.inputString = inputString;
    this.isCameraActive = false;
  }
  }
};
</script>
