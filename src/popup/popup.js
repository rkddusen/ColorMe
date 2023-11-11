document.addEventListener('DOMContentLoaded', function (){
    document.getElementById("addBtn").addEventListener("click", okay);
    document.getElementById("color-value").addEventListener('click', () => {
        Coloris({
            theme: 'polaroid',
            themeMode: 'auto',
            alpha: false,
        });
    });
    document.getElementById("resetBtn").addEventListener("click", reset);
    document.getElementById("saveBtn").addEventListener("click", save);
    document.getElementById("cancelBtn").addEventListener("click", cancel);
    document.getElementById("combination-name").addEventListener("keypress", (e) => {
        if(e.key == 'Enter'){
            e.preventDefault();
            save();
        }
    });
    
    chrome.runtime.sendMessage({ action: 'getColors' });
    chrome.runtime.sendMessage({ action: 'getNotSavingColors' });
})


// 추가한 색상들을 저장하는 배열
let colorArr = [];
// 저장된 색상들을 저장하는 객체
let savedColors = {};

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if(request.action === 'savedColors') {
        savedColors = request.data;
        printSavedColors();
    }
    else if(request.action === 'notSavedColors') {
        let notSaving = request.data || [];
        for(let i = 0; i < notSaving.length; i++){
            plusColor(notSaving[i], i + 1)
        }
        if(notSaving.length < 1){
            document.getElementById("color-palette-explain").style.display = 'flex';
        } else{
            document.getElementById("color-palette-explain").style.display = 'none';
        }
    }
    else if(request.action === 'alertColorChange') {
        if(colorArr.length < 1){
            document.getElementById("color-palette-explain").style.display = 'flex';
        } else{
            document.getElementById("color-palette-explain").style.display = 'none';
        }
    }
});

// local에서 모든 데이터를 가져오기 전에 초기화시키기
function savedColorsInit() {
    let color_saved = document.getElementById("color-saved");
    while (color_saved.firstChild) {
        color_saved.removeChild(color_saved.firstChild);
    }
}
// local에서 가져온 모든 데이터 출력
function printSavedColors() {
    savedColorsInit();
    for(let key in savedColors){
        let color_saved = document.getElementById("color-saved");
        
        let color_list = document.createElement("div");
        color_list.classList.add("color-list");

        let color_list_btn = document.createElement("div");
        color_list_btn.classList.add("color-list-btn");
        let color_list_btn1 = document.createElement("button");
        color_list_btn1.classList.add("color-list-btn1");
        color_list_btn1.textContent = 'Code';
        let color_list_btn2 = document.createElement("button");
        color_list_btn2.classList.add("color-list-btn2");
        color_list_btn2.textContent = 'Edit';
        let color_list_btn3 = document.createElement("button");
        color_list_btn3.classList.add("color-list-btn3");
        color_list_btn3.textContent = 'Delete';

        let color_list_body = document.createElement("div");
        color_list_body.classList.add("color-list-body");
        
        let color_list_title = document.createElement("p");
        color_list_title.textContent = key;
        color_list_title.classList.add("color-list-title");
        
        let color_list_palette = document.createElement("div");
        color_list_palette.classList.add("color-list-palette");
        for(let i = 0; i < savedColors[key].length; i++){
            let color_list_palette_item = document.createElement("div");
            color_list_palette_item.classList.add("color-list-palette-item");
            color_list_palette_item.style.backgroundColor = savedColors[key][i];
            color_list_palette.appendChild(color_list_palette_item);
        }

        color_list_btn.append(color_list_btn1, color_list_btn2, color_list_btn3)
        color_list_body.append(color_list_title, color_list_palette);
        color_list.append(color_list_btn, color_list_body);
        color_saved.appendChild(color_list);
        
        // html 형태
        // <div class="color-list">
        //     <div class="color-list-btn">
        //         <button>Code</button>
        //         <button>Edit</button>
        //         <button>Delete</button>
        //     </div>
        //     <div class="color-list-body">
        //         <p class="color-list-title">title</p>
        //         <div class="color-list-palette">
        //             <div class="color-list-palette-item"></div>
        //             <div class="color-list-palette-item"></div>
        //             <div class="color-list-palette-item"></div>
        //         </div>
        //     </div>
        // </div>
    }

    let color_list = document.getElementsByClassName("color-list");
    for (let i = 0; i < color_list.length; i++) {
        let key = color_list[i].getElementsByClassName("color-list-title")[0].textContent;
        
        // 마우스엔터 이벤트 추가
        color_list[i]
            .getElementsByClassName("color-list-body")[0]
            .addEventListener("mouseenter", () => openBtns(i));
        // 마우스리브 이벤트 추가
        color_list[i]
            .getElementsByClassName("color-list-btn")[0]
            .addEventListener("mouseleave", () => closeBtns(i, key));

        // Code 버튼 클릭 이벤트
        color_list[i]
            .getElementsByClassName("color-list-btn1")[0]
            .addEventListener("click", () => openColor(i, key));
        // Edit 버튼 클릭 이벤트
        color_list[i]
            .getElementsByClassName("color-list-btn2")[0]
            .addEventListener("click", () => editColor(key));
        // Delete 버튼 클릭 이벤트
        color_list[i]
            .getElementsByClassName("color-list-btn3")[0]
            .addEventListener("click", () => deleteColor(key));
    }
}


// 색상을 추가
function okay() {
    let count = colorArr.length;
    if (count === 5) {
        // 리스트에 있는 색상의 수가 5개일 때
        alert("You can save 5 once.");
    } else {
        count++;
        let color_value = document.getElementById("color-value").value;
        plusColor(color_value, count);
        // 임시 저장
        chrome.runtime.sendMessage({ action: 'notSavingColors', colors: colorArr });
    }
}

// colorArr배열에 색상 추가하기
function plusColor(color_value, count) {
    colorArr.push(color_value);
    printColor(count);
}

// 색상이 추가되면 리스트에 추가
function printColor(count) {
    // 리스트를 만들어서 추가
    let color_name = document.getElementById("color-name");

    let color_row = document.createElement("li");
    color_row.classList.add("color-row");

    let color_up = document.createElement("img");
    color_up.src = '../images/up.svg';
    color_up.addEventListener("click", () => move(count - 1, -1));
    color_up.classList.add("color-row-manage");
    let color_down = document.createElement("img");
    color_down.src = '../images/down.svg';
    color_down.addEventListener("click", () => move(count - 1, 1));
    color_down.classList.add("color-row-manage");

    let color_trash = document.createElement("img");
    color_trash.src = '../images/trash.svg';
    color_trash.addEventListener("click", () => trash(count - 1));
    color_trash.classList.add("color-row-manage");

    let color_code = document.createElement("p");
    color_code.textContent = colorArr[count - 1];

    color_row.append(color_code, color_up, color_down, color_trash);
    color_name.appendChild(color_row);

    // 팔레트에 해당 색상을 배경색으로 갖는 div 추가
    let color_palette = document.getElementById("color-palette");
    let color_div = document.createElement("div");
    color_div.classList.add("color");
    color_div.style.backgroundColor = colorArr[count - 1];
    color_palette.appendChild(color_div);
}

function move(index, mode) {
    if((mode === -1 && index > 0) || (mode === 1 && index < colorArr.length - 1)){
        let temp = colorArr[index + mode];
        colorArr[index + mode] = colorArr[index];
        colorArr[index] = temp;

        let arr = colorArr;

        reset();
        for(let i = 0; i < arr.length; i++){
            plusColor(arr[i], i + 1);
        }
        // 임시 저장
        chrome.runtime.sendMessage({ action: 'notSavingColors', colors: colorArr });
    }
}
function trash(index) {
    colorArr.splice(index, 1);
    let arr = colorArr;

    reset();
        for(let i = 0; i < arr.length; i++){
            plusColor(arr[i], i + 1);
        }
        // 임시 저장
        chrome.runtime.sendMessage({ action: 'notSavingColors', colors: colorArr });
}

// 현재 조합 저장
function save() {
    if(document.getElementsByClassName("color-list").length < 30){
        let combination_name = document.getElementById("combination-name").value;
    
        if(combination_name.length >= 1 && combination_name.length <= 10 && colorArr.length > 0){
            let btn = document.getElementById("saveBtn");
            if(btn.textContent === 'Save'){
                if(savedColors[combination_name]){
                    if(confirm('Same name already exists.\nWould you like to overwrite it?')){
                        saving(combination_name);
                    }
                } else{
                    saving(combination_name);
                }
            } else{
                saving(combination_name);
                editToSave();
            }
        } else if(combination_name.length < 1 || combination_name.length > 10){
            alert('Enter your combination name. (1-10 characters)');
        } else if(colorArr.length <= 0){
            alert('Please select your colors');
        }
    } else{
        alert('You can save up to 30 combinations.');
    }
}
function saving(str) {
    // 배열을 문자열로 변환하여 background.js에 전달
    chrome.runtime.sendMessage({ action: 'saveColors', name: str ,colors: colorArr });
    reset();
    document.getElementById("combination-name").value = '';
}
function editToSave() {
    // edit을 save으로 바꾸기
    let btn = document.getElementById("saveBtn");
    let new_btn = btn.cloneNode(true);
    new_btn.textContent = 'Save';
    new_btn.addEventListener("click", save);
    btn.parentNode.replaceChild(new_btn, btn);
}

// 현재 조합 초기화
function reset() {
    colorArr = [];
    // document.getElementById("combination-name").value = '';
    resetPalette();
    // 임시 저장
    chrome.runtime.sendMessage({ action: 'notSavingColors', colors: colorArr });
}
function resetPalette() {
    let color_name = document.getElementById("color-name");
    while (color_name.firstChild) {
        color_name.removeChild(color_name.firstChild);
    }
    let color_palette = document.getElementById("color-palette");
    var color = color_palette.getElementsByClassName("color");

    // Remove each color node
    while (color.length > 0) {
        color_palette.removeChild(color[0]);
    }
}

function edit(key) {
    if(key !== document.getElementById("combination-name").value){
        deleteColor(key);
    }
    save();
}

function cancel() {
    reset();
    document.getElementById("combination-name").value = '';
    editToSave();
}



function openBtns(index) { 
    let color_list_btn = document.getElementsByClassName("color-list-btn")[index];
    color_list_btn.style.display = 'flex';
}
function closeBtns(index) {
    let color_list_btn = document.getElementsByClassName("color-list-btn")[index];
    color_list_btn.style.display = 'none';
}

// Code 버튼 눌렀을 때 색상코드 표시
function openColor(index, key) {
    let color_list = document.getElementsByClassName("color-list")[index];
    
    if(!color_list.getElementsByClassName('color-list-code')[0]){
        let clear = document.getElementsByClassName("color-list-code")[0];
        if(clear){
            clear.parentNode.removeChild(clear);
        }

        let color_list_code = document.createElement("ol");
        color_list_code.classList.add('color-list-code');
        for(let i = 0; i < savedColors[key].length; i++){
            let color_list_code_detail = document.createElement("li");
            color_list_code_detail.textContent = savedColors[key][i];
            color_list_code.appendChild(color_list_code_detail);
        }
        color_list.appendChild(color_list_code);
    } else{
        let clear = document.getElementsByClassName("color-list-code")[0];
        if(clear){
            clear.parentNode.removeChild(clear);
        }
    }
}

// Edit 버튼 눌렀을 때
function editColor(key) {
    reset();
    document.getElementById("combination-name").value = '';
    for(let i = 0; i < savedColors[key].length; i++){
        plusColor(savedColors[key][i], i + 1)
    }
    document.getElementById("combination-name").value = key;

    // save버튼 edit으로 바꾸기
    let btn = document.getElementById("saveBtn");
    btn.textContent = 'Edit';
    btn.removeEventListener("click", save);
    btn.addEventListener("click", () => edit(key));
}


// Delete 버튼 눌렀을 때
function deleteColor(key) {
    chrome.runtime.sendMessage({ action: 'deleteColor', key: key });
}