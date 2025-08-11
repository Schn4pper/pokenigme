export default class CryptoHelper {
	
	static async encryptData(data: string): Promise<string | null> {
		const response = await fetch("./encrypt.php", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ action: "encrypt", data }),
		});

		const result = await response.json();
		return result.encrypted || null;
	}

	static async decryptData(encrypted: string): Promise<string | null> {
		const response = await fetch("./encrypt.php", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ action: "decrypt", data: encrypted }),
		});

		const result = await response.json();
		return result.decrypted || null;
	}
}