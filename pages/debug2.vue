<template>
  <div>
    <button @click="connectToPhantom">Connect to Phantom Wallet</button>
    <div v-if="sessionData">
      <h3>Session Data:</h3>
      <pre>{{ sessionData }}</pre>
    </div>
    <div v-if="connectionError" class="error-message">{{ connectionError }}</div>
  </div>
</template>

<script setup>
import nacl from 'tweetnacl';
import bs58 from 'bs58';

const sessionData = ref(null);
const connectionError = ref(null);

function generateKeyPair() {
  const keyPair = nacl.box.keyPair();
  return {
    publicKey: bs58.encode(Buffer.from(keyPair.publicKey)),
    secretKey: keyPair.secretKey,
  };
}

function createDeepLinkUrl(appUrl, redirectUrl, publicKey) {
  const encodedAppUrl = encodeURIComponent(appUrl);
  const encodedRedirectUrl = encodeURIComponent(redirectUrl);
  return `https://phantom.app/ul/v1/connect?app_url=${encodedAppUrl}&dapp_encryption_public_key=${publicKey}&redirect_link=${encodedRedirectUrl}`;
}

const connectToPhantom = () => {
  try {
    const { publicKey } = generateKeyPair();
    const appUrl = 'https://app.lunadefi.ai';
    const redirectUrl = 'https://app.lunadefi.ai/debug2';
    const deepLinkUrl = createDeepLinkUrl(appUrl, redirectUrl, publicKey);
    window.open(deepLinkUrl, '_blank');
  } catch (error) {
    connectionError.value = 'Error connecting to Phantom Wallet.';
    console.error('Connection error:', error);
  }
};

const handlePhantomResponse = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const publicKey = urlParams.get('public_key');
  const session = urlParams.get('session');
  const errorCode = urlParams.get('errorCode');
  const errorMessage = urlParams.get('errorMessage');

  if (publicKey && session) {
    sessionData.value = { publicKey, session };
  } else if (errorCode && errorMessage) {
    connectionError.value = `Error ${errorCode}: ${errorMessage}`;
  } else {
    connectionError.value = 'Invalid response from Phantom.';
  }
};

onMounted(() => {
  handlePhantomResponse();
});
</script>

<style scoped>
.error-message {
  color: red;
  margin-top: 10px;
}
</style>
