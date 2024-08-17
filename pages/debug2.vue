<template>
  <div>
    <button @click="connectToPhantom">Conectar con Phantom</button>
    <div v-if="session">
      <h3>Sesión Conectada:</h3>
      <pre>{{ session }}</pre>
    </div>
    <div v-else>
      <p>No hay sesión conectada.</p>
    </div>
  </div>
</template>

<script setup>

// Ref para almacenar la sesión
const session = ref(null);

// Función para generar un nonce aleatorio
function generateNonce(length = 24) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
}

// Función para conectar a Phantom Wallet utilizando deep links
async function connectToPhantom() {
  try {
    const appUrl = encodeURIComponent('https://app.lunadefi.ai');
    const dappEncryptionPublicKey = 'tu-public-key-aqui'; // Debes generar tu propia clave pública para el cifrado
    const redirectLink = encodeURIComponent('https://app.lunadefi.ai/callback');
    const cluster = 'mainnet-beta'; // Puedes cambiarlo a 'testnet' o 'devnet' según sea necesario
    const baseUrl = `https://phantom.app/ul/v1/connect`;

    const url = `${baseUrl}?app_url=${appUrl}&dapp_encryption_public_key=${dappEncryptionPublicKey}&redirect_link=${redirectLink}&cluster=${cluster}`;

    // Usar el deep link para abrir Phantom
    window.location.href = url;
  } catch (error) {
    console.error('Error al conectar con Phantom:', error);
  }
}

// Después de redirigir de Phantom, puedes manejar la respuesta en otra ruta o componente
// Aquí se ejemplifica cómo podrías manejar la sesión devuelta por Phantom

async function handlePhantomResponse() {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionParam = urlParams.get('session');

  if (sessionParam) {
    // Almacenar la sesión para futuros usos
    session.value = sessionParam;

    console.log('Sesión conectada:', session.value);
  } else {
    console.error('No se recibió sesión de Phantom.');
  }
}

// Llamar a la función para manejar la respuesta si ya está de regreso de Phantom
handlePhantomResponse();
</script>
