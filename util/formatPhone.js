export default function formatPhone(purpose, phoneString) {
    
    const area = phoneString.slice(0, 3);
    const first3 = phoneString.slice(3, 6);
    const last4 = phoneString.slice(6, 10);

    if (purpose === 'link') {
        return `tel:+1-${area}-${first3}-${last4}`
    }

    if (purpose === 'display') {
        return `${area}.${first3}.${last4}`
    }
}