let tg = window.Telegram.WebApp;
tg.expand();

let selectedItem = null;
let selectedPrice = 0;

function selectProduct(cardElement) {
    selectedItem = cardElement.getAttribute('data-name');
    selectedPrice = cardElement.getAttribute('data-price');

    document.getElementById('item-name').innerText = selectedItem;
    document.getElementById('item-price').innerText = `$${selectedPrice}`;
    document.getElementById('selected-info').classList.remove('hidden');

    document.querySelectorAll('.card').forEach(c => c.classList.remove('active'));
    cardElement.classList.add('active');
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('buyer-date').value = today;
}

function sendDataToBot() {
    if (!selectedItem) {
        alert('សូមជ្រើសរើសទំនិញសិន!');
        return;
    }
    const buyerName = document.getElementById('buyer-name').value.trim();
    const buyerDate = document.getElementById('buyer-date').value;
    const fileInput = document.getElementById('slip-file');

    if (!buyerName || !buyerDate) {
        alert('សូមបំពេញឈ្មោះ និងថ្ងៃខែឆ្នាំ!');
        return;
    }

    if (fileInput.files.length === 0) {
        alert('សូមแนบរូបសลิបបង់ប្រាក់!');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
        const payload = JSON.stringify({
            item: selectedItem,
            price: selectedPrice,
            name: buyerName,
            date: buyerDate,
            slipBase64: event.target.result
        });

        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            tg.sendData(payload);
        } else {
            alert(`ទិន្នន័យបញ្ជូនទៅ Bot (ტេស្ត):\nItem: ${selectedItem}\nName: ${buyerName}\nDate: ${buyerDate}`);
        }
        tg.close();
    };
    reader.readAsDataURL(file);
}
