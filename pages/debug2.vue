<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-center">
      <button class="btn btn-primary" @click="connectToPhantom" v-if="!sessionData">Connect to Phantom Wallet</button>
      <button class="btn btn-secondary" @click="disconnectFromPhantom" v-if="sessionData">Disconnect from Phantom Wallet</button>
    </div>
    <div v-if="sessionData" class="mt-3">
      <h3>Session Data:</h3>
      <pre>{{ sessionData }}</pre>
    </div>
    <div v-if="connectionError" class="alert alert-danger mt-3" role="alert">
      {{ connectionError }}
    </div>
  </div>
</template>

<script setup>
import nacl from 'tweetnacl';
import bs58 from 'bs58';

const sessionData = ref(null);
const connectionError = ref(null);
const router = useRouter();
function generateKeyPair() {
  const keyPair = nacl.box.keyPair();
  console.log('Generated key pair:', keyPair);
  return {
    publicKey: bs58.encode(keyPair.publicKey),
    secretKey: keyPair.secretKey,
  };
}

function createDeepLinkUrl(appUrl, redirectUrl, publicKey) {
  const encodedAppUrl = encodeURIComponent(appUrl);
  const encodedRedirectUrl = encodeURIComponent(redirectUrl);
  return `https://phantom.app/ul/v1/connect?app_url=${encodedAppUrl}&dapp_encryption_public_key=${publicKey}&redirect_link=${encodedRedirectUrl}&same_tab=true`;
}

const connectToPhantom = () => {
  try {
    if (!sessionData.value) {
      const { publicKey } = generateKeyPair();
      const appUrl = useRuntimeConfig().public.appURL;
      const telegramBotUsername = useRuntimeConfig().public.tgBotUsername;

      // const telegramDeepLink = `tg://resolve?domain=${telegramBotUsername}&startapp&mode=fullview`;
	    const telegramDeepLink = `https://t.me/${telegramBotUsername}?startapp&mode=full`
	    const deepLinkUrl = createDeepLinkUrl(appUrl, telegramDeepLink, publicKey);

      console.log('Opening deep link URL:', deepLinkUrl);
      window.open(deepLinkUrl, '_blank');

      connectionError.value = 'Please complete the connection in the Phantom Wallet popup.';
    } else {
      console.log('Already connected to Phantom. Session data:', sessionData.value);
    }
  } catch (error) {
    connectionError.value = 'Error connecting to Phantom Wallet.';
    console.error('Connection error:', error);
  }
};

const disconnectFromPhantom = () => {
  sessionData.value = null;
  localStorage.removeItem('phantomSession');
  console.log('Disconnected from Phantom Wallet');
};

const handlePhantomResponse = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const publicKey = urlParams.get('public_key');
  const session = urlParams.get('session');
  const errorCode = urlParams.get('errorCode');
  const errorMessage = urlParams.get('errorMessage');
  if (publicKey && session) {
    sessionData.value = { publicKey, session };
    console.log('Session data received:', sessionData.value);
    connectionError.value = null;
  } else if (errorCode && errorMessage) {
    connectionError.value = `Error ${errorCode}: ${errorMessage}`;
    console.error('Phantom connection error:', connectionError.value);
  } else {
    console.warn('Unexpected response from Phantom. Please check your configuration.');
  }
};

// Listener para el evento 'storage'
onMounted(() => {
	const params = router.currentRoute.value.query; // or router.currentRoute.value.params
	console.log('----------------------------->URL params:', params);
});

</script>
