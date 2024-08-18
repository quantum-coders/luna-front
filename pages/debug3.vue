<template>
	<pre>{{ useRoute().query }}</pre>
</template>

<script setup>
	import nacl from 'tweetnacl';
	import bs58 from 'bs58';
	import util from 'tweetnacl-util';
	import { Buffer } from "buffer";

	import { parseInitData } from '@telegram-apps/sdk';
	const initDataString = '#tgWebAppData=user={"id":1951333749,"first_name":"Rodrigo","last_name":"Tejero","username":"thewebchimp","language_code":"es","is_premium":true,"allows_write_to_pm":true}&chat_instance=7742806558117784619&chat_type=sender&auth_date=1723982328&hash=c6712f5f796f675e8d172e7d9c967d6cfa68b933d89dfe408fdaf2aee8bcd4f4&tgWebAppVersion=7.8&tgWebAppPlatform=android&tgWebAppThemeParams={"bg_color":"#212d3b","section_bg_color":"#1d2733","secondary_bg_color":"#151e27","text_color":"#ffffff","hint_color":"#7d8b99","link_color":"#5eabe1","button_color":"#50a8eb","button_text_color":"#ffffff","header_bg_color":"#242d39","accent_text_color":"#64b5ef","section_header_text_color":"#79c4fc","subtitle_text_color":"#7b8790","destructive_text_color":"#ee686f","section_separator_color":"#0d1218"}';

	// Extract init data.
	console.log(parseInitData(initDataString));
	console.log(parseInitData(new URLSearchParams(initDataString)));

	/*function decryptPayload(payloadBase58, nonceBase58, keyUint8Array) {
		try {
			// Decode the payload and nonce from Base58
			const payload = bs58.decode(payloadBase58);
			const nonce = bs58.decode(nonceBase58);

			console.log('Decoded Payload Length:', payload.length); // Debug: check length
			console.log('Decoded Nonce Length:', nonce.length); // Debug: check length
			console.log('Key Length:', keyUint8Array.length); // Debug: check length

			if(nonce.length !== 24) {
				throw new Error('Nonce must be 24 bytes long');
			}

			if(keyUint8Array.length !== 32) {
				throw new Error('Key must be 32 bytes long');
			}

			// Decrypt the payload
			const decrypted = nacl.box.open.after(payload, nonce, keyUint8Array);

			if(!decrypted) {
				throw new Error('Decryption failed');
			}

			// Convert decrypted Uint8Array to a string (assuming UTF-8 encoding)
			const decryptedMessage = new TextDecoder().decode(decrypted);

			return decryptedMessage;
		} catch(err) {
			console.error('Error decrypting payload:', err);
			return null;
		}
	}

	console.log(decryptPayload(
		'2rHH7QFeVDz6rswtk8JMpsrHwhVAq9EyLano4u1MrjXiC2NYZrceKpt7aFQtMro9JpCnVkLjwrF6tb6782PvwmCHnXmVxNaADrTKETh3UHgffZ53q87RHvwJxgKjYY6haxXKUo6AkNPqLXe6CTSBVAmzAYfsaKm8BayvVzunHmGBeFMqkkW84bxCacdscsEE48oUfcceof6NRqGv43cY5PfYmqUL1avkguDWJspnLZjrWMDwhRQV7RxntydrnHvmaMEGno6w3etzcxdnizYfx7uyH5R8PNuNqDH79BXK8rtLb6jzMWpKeGCxUdisUBH4C4by2Aj54wsSLZnxtGfuExQJ6v7hbdgwZ2wsaBMUQyARYcmvHvNFx5JxMN2EBsVeyzg3VHrFTWT83EB6zZPz9h8yh8SbCCvXVj1csRQnSJWeDHJeBCb',
		'BqVQV1DdoetDVz4FNAanaCdoPHGRJv7M7',
		new Uint8Array([205, 19, 2, 226, 186, 138, 85, 160, 57, 73, 108, 81, 139, 208, 196, 53, 47, 197, 195, 176, 42, 14, 127, 166, 251, 151, 210, 226, 39, 211, 154, 191]),
	));*/

	const sharedSecret = nacl.box.before(
		bs58.decode('38djZ1mar8Ezs45atGhAfDSUUHzbnrZLktFJXjL2Gouw'),
		new Uint8Array([208, 4, 192, 11, 19, 32, 163, 169, 140, 247, 189, 207, 113, 31, 232, 32, 67, 130, 204, 186, 152, 11, 210, 247, 189, 189, 192, 79, 215, 124, 135, 146]),
	);

	console.log('sharedSecret', sharedSecret);

	const decryptPayload = (data, nonce, sharedSecret) => {
		if(!sharedSecret) throw new Error('missing shared secret');

		const decryptedData = nacl.box.open.after(bs58.decode(data), bs58.decode(nonce), sharedSecret);
		if(!decryptedData) {
			throw new Error('Unable to decrypt data');
		}
		return JSON.parse(Buffer.from(decryptedData).toString('utf8'));
	};

	const decryptedData = decryptPayload(
		'nMhXA9JwKSjNtf7DehDGw6Z96RQQtZap9MremT9HxsgfsZRqCrTZKwfzUyjLVup5irHwAJf3FeUXNg3AA6GEWEFAShFVwpLsD3ja5KEj8Wm8Mqrf7RenQpf2je8APix6m7MGzQxbgEh6huaa7dag9TqHS7ZgxB2uTtZ17x9NTQCHXwG25ZYPNyFteH7XMUZ25Md8pYmp2kMPWCsLiGCWSGXqmPHdqGb2atGvfHA9PG8rw1jeiraLwGW4yLq2E8xMq5UnDUhVwxAHhwT5dYZ689pzfRqX6g9uVyaLVzKCfgzuwbgb1VSfN7QjsD6UFjAoPyFA2VtzmbPgMKxrBaFNwykv38RHTCjmZU6poRFDf74DL8xEPdwgdSnNVynVQRCYDv3dNPHCRSgfo6Xbpmrq8RpKqaZZAaHM9NHRikPLUtTHqSBgc5q',
		'AT9sarC2gdPZyLbwejtD6FCwUvTgnTMSc',
		sharedSecret,
	);

	console.log('decryptedData', decryptedData);

	// redirect on mounted
	onMounted(() => {
		//document.location.href = 'https://t.me/lunadebugbot/blinks?startapp=lavergadesatan&mode=full';
	});
</script>

<!--suppress SassScssResolvedByNameOnly -->
<style lang="sass" scoped>

</style>