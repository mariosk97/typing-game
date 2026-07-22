// =====================================
// ΠΑΙΧΝΙΔΙ ΠΛΗΚΤΡΟΛΟΓΗΣΗΣ
// Version 1.0
// =====================================


// -----------------------------
// ΣΤΟΙΧΕΙΑ HTML
// -----------------------------

const modeButtons = document.querySelectorAll('input[name="mode"]');

const wordBox = document.getElementById("wordBox");

const listSelect = document.getElementById("listSelect");

const menuScreen = document.getElementById("menuScreen");
const gameScreen = document.getElementById("gameScreen");
const finishScreen = document.getElementById("finishScreen");

const startButton = document.getElementById("startButton");
const restartButton = document.getElementById("restartButton");

const targetItem = document.getElementById("targetWord");
const wordImage = document.getElementById("wordImage");
const typedWord = document.getElementById("typedWord");

const progress = document.getElementById("progress");

const correctCountText = document.getElementById("correctCount");
const wrongCountText = document.getElementById("wrongCount");

const finalCorrect = document.getElementById("finalCorrect");
const finalWrong = document.getElementById("finalWrong");



// -----------------------------
// ΜΕΤΑΒΛΗΤΕΣ ΠΑΙΧΝΙΔΙΟΥ
// -----------------------------

let words = [];
let letters = [];
let sentences = [];

let currentIndex = 0;
let currentItem  = "";
let typed = "";

let correct = 0;
let wrong = 0;

let mode = "letters";
let randomOrder = true;

let ignoreAccents = true;
let ignoreCase = true;

let difficulty = "beginner";

let currentListName = "";



// -----------------------------
// ΑΛΦΑΒΗΤΑ
// -----------------------------

const greekAlphabet = [
    "Α","Β","Γ","Δ","Ε","Ζ","Η","Θ","Ι","Κ",
    "Λ","Μ","Ν","Ξ","Ο","Π","Ρ","Σ","Τ","Υ",
    "Φ","Χ","Ψ","Ω"
];


// -----------------------------
// EVENT LISTENERS
// -----------------------------

startButton.addEventListener("click", startGame);


restartButton.addEventListener("click", () => {

    finishScreen.classList.add("hidden");

    menuScreen.classList.remove("hidden");

});

modeButtons.forEach(button => {

    button.addEventListener(
        "change",
        updateModeMenu
    );

});

updateModeMenu();

document.addEventListener(
"keydown",
function(event){

    if(gameScreen.classList.contains("hidden")){

        return;

    }



    let key = event.key;



	// Διαχείριση Backspace

	if(key === "Backspace") {


		if(typed.length > 0) {


			typed = typed.slice(0, -1);


			typedWord.textContent = typed;

		}


		return;

	}



	// αγνοούμε άλλα ειδικά πλήκτρα

	if(key.length !== 1){

		return;

	}


    let expected =
        normalize(currentItem[typed.length]);



    let pressed =
        normalize(key);



    if(pressed === expected){


        typed += currentItem[typed.length];


        typedWord.textContent = typed;



        if(typed.length === currentItem.length){


            correct++;


            correctCountText.textContent = correct;



            currentIndex++;



            setTimeout(
                nextItem,
                700
            );


        }


    }

    else {


        wrong++;


        wrongCountText.textContent = wrong;
		
		showWrongLetter(key);


    }



});



// -----------------------------
// START
// -----------------------------

async function startGame() {

    mode = document.querySelector(
        'input[name="mode"]:checked'
    ).value;

    randomOrder =
        document.querySelector(
            'input[name="order"]:checked'
        ).value === "random";

    ignoreAccents =
        document.getElementById(
            "ignoreAccents"
        ).checked;

    ignoreCase =
        document.getElementById(
            "ignoreCase"
        ).checked;

    difficulty =
        document.querySelector(
            'input[name="difficulty"]:checked'
        ).value;

    // ---------- ΓΡΑΜΜΑΤΑ ----------
    if(mode === "letters"){

        letters = [...greekAlphabet];

        if(randomOrder){
            shuffle(letters);
        }

        targetItem.classList.remove("wordMode");
        typedWord.classList.remove("wordMode");
    }

    // ---------- ΛΕΞΕΙΣ ----------
    else if(mode === "words"){

        const selectedList =
            document.getElementById(
                "listSelect"
            ).value;

        currentListName = selectedList;

        words = loadWords(selectedList);

        if(randomOrder){
            shuffle(words);
        }

        targetItem.classList.add("wordMode");
        typedWord.classList.add("wordMode");
    }

    // ---------- ΠΡΟΤΑΣΕΙΣ ----------
    else if(mode === "sentences"){

        const selectedList =
            document.getElementById(
                "listSelect"
            ).value;

        sentences =
            [...sentenceLists[selectedList]];

        if(randomOrder){
            shuffle(sentences);
        }

        targetItem.classList.remove("wordMode");
        typedWord.classList.remove("wordMode");
    }

    currentIndex = 0;
    correct = 0;
    wrong = 0;

    correctCountText.textContent = correct;
    wrongCountText.textContent = wrong;

    menuScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    nextItem();
}



// -----------------------------
// ΕΠΟΜΕΝΗ ΛΕΞΗ
// -----------------------------

function nextItem(){


	const list = getCurrentList();

	if(currentIndex >= list.length){

		finishGame();

		return;

	}



	currentItem = list[currentIndex];


    typed = "";


    typedWord.textContent = "";


    targetItem.textContent = currentItem;
	
	updateImage();



	progress.textContent =
	`${currentIndex + 1}/${list.length}`;

}

function finishGame(){


    gameScreen.classList.add("hidden");

    finishScreen.classList.remove("hidden");



    finalCorrect.textContent = correct;

    finalWrong.textContent = wrong;


}



// -----------------------------
// ΠΛΗΚΤΡΟΛΟΓΙΟ
// -----------------------------



function showWrongLetter(letter){


    if(difficulty === "advanced"){


        typed += letter;

        typedWord.innerHTML =
            typedWord.innerHTML +
            `<span class="wrong">${letter}</span>`;

        return;

    }



    // Αρχάριος

    typedWord.innerHTML =
        typed +
        `<span class="wrong">${letter}</span>`;



    setTimeout(()=>{


        typedWord.textContent = typed;


    },700);


}


function updateImage(){

    if(mode !== "words"){

        wordImage.classList.add("hidden");
        return;

    }

    const extensions = [
        "png",
        "jpg",
        "jpeg",
        "webp"
    ];

    loadImage(extensions,0);

}


function loadImage(extensions,index){

    if(index >= extensions.length){

        wordImage.classList.add("hidden");
        return;

    }

    const path =
        `images/${currentListName}/${currentItem}.${extensions[index]}`;

    wordImage.onload = ()=>{

        wordImage.classList.remove("hidden");

    };

    wordImage.onerror = ()=>{

        loadImage(
            extensions,
            index+1
        );

    };

    wordImage.src = path;

}



// -----------------------------
// ΚΑΝΟΝΙΚΟΠΟΙΗΣΗ ΓΡΑΜΜΑΤΩΝ
// -----------------------------

function normalize(letter){


    let result = letter;



    if(ignoreCase){

        result = result.toUpperCase();

    }



    if(ignoreAccents){

        result =
        result.normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    }



    return result;


}





// -----------------------------
// ΑΝΑΚΑΤΕΜΑ ΛΙΣΤΑΣ
// -----------------------------

function shuffle(array){


    for(
        let i = array.length - 1;
        i > 0;
        i--
    ){

        const j =
        Math.floor(
            Math.random() * (i + 1)
        );


        [
            array[i],
            array[j]
        ] =
        [
            array[j],
            array[i]
        ];

    }


}




// -----------------------------
// ΤΕΛΟΣ ΠΑΙΧΝΙΔΙΟΥ
// -----------------------------



// -----------------------------
// ΦΟΡΤΩΣΗ ΑΡΧΕΙΟΥ TXT
// -----------------------------

function loadWords(listName) {

    return [...wordLists[listName]];

}


function getCurrentList(){

    switch(mode){

        case "letters":
            return letters;

        case "words":
            return words;

        case "sentences":
            return sentences;

    }

}

function updateModeMenu(){

	const mode =
        document.querySelector(
            'input[name="mode"]:checked'
        ).value;

	listSelect.innerHTML = "";
	
	if(mode === "letters"){

		wordBox.classList.add("hidden");

		return;

	}

wordBox.classList.remove("hidden");
	
	if(mode==="words"){

    listSelect.innerHTML=`

        <option value="δισυλλαβες">
            Δισύλλαβες
        </option>

        <option value="τρισυλλαβες">
            Τρισύλλαβες
        </option>

        <option value="τετρασυλλαβες">
            Τετρασύλλαβες
        </option>

    `;

	}else if(mode==="sentences"){

    listSelect.innerHTML=`

        <option value="ευκολες">
            Εύκολες
        </option>

        <option value="μεσαίες">
            Μεσαίες
        </option>

    `;

	}

}



