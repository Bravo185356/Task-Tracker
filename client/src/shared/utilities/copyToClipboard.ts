export async function copyToClipboard(text: string): Promise<boolean> {
	try {
		if (navigator?.clipboard?.writeText) {
			await navigator.clipboard.writeText(text);
            
			return true;
		}
	} catch {}

	const input = document.createElement('input');
	input.value = text;
	input.setAttribute('readonly', 'true');
	input.style.position = 'fixed';
	input.style.top = '-1000px';
	input.style.left = '-1000px';

	document.body.appendChild(input);
	input.select();
	input.setSelectionRange(0, input.value.length);

	const ok = document.execCommand('copy');
	document.body.removeChild(input);

	if (!ok) {
        return false;
	}

	return true;
}
