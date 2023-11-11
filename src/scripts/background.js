// popup.js로부터 데이터를 받는 리스너를 설정
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.action === 'saveColors') {
        // 받은 배열을 localStorage에 저장
        const name = request.name;
        const colors = request.colors;
        // local에 key - name, value - colors로 저장
        chrome.storage.local.set({ [name]: colors }, function() {
            // 저장이 끝나면, local의 모든 데이터를 가져와서 popup.js로 전달
            chrome.storage.local.get(null, function(data) {
                delete data['9hXeLmpL6W'];
                chrome.runtime.sendMessage({ action: 'savedColors', data: data });
            })
        });
    }
    else if(request.action === 'notSavingColors') {
        // 받은 배열을 localStorage에 저장
        const name = '9hXeLmpL6W'; // 임시 저장 key
        const colors = request.colors;
        // local에 key - name, value - colors로 저장
        chrome.storage.local.set({ [name]: colors }, function() {
            chrome.runtime.sendMessage({ action: 'alertColorChange' });
        })
    }
    else if(request.action === 'getNotSavingColors') {
        chrome.storage.local.get('9hXeLmpL6W', function(data) {
            chrome.runtime.sendMessage({ action: 'notSavedColors', data: data['9hXeLmpL6W'] });
        })
    }
    else if(request.action === 'getColors'){
        chrome.storage.local.get(null, function(data) {
            delete data['9hXeLmpL6W'];
            chrome.runtime.sendMessage({ action: 'savedColors', data: data });
        })
    }
    else if(request.action === 'deleteColor'){
        const key = request.key;
        chrome.storage.local.remove(key, function() {
            // 삭제가 끝나면, local의 모든 데이터를 가져와서 popup.js로 전달
            chrome.storage.local.get(null, function(data) {
                delete data['9hXeLmpL6W'];
                chrome.runtime.sendMessage({ action: 'savedColors', data: data });
            })
        });
    }
});