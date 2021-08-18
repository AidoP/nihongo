var all_words = null;
var all_kanji = null;
var dmak = null;

fetch("words.json")
    .then(response => response.json())
    .then(data => {
        all_words = data;
        set_word(word_search.value);
    });
fetch("kanji.json")
    .then(response => response.json())
    .then(data => {
        all_kanji = data;
        set_kanji(kanji_search.value);
    });

function set_search_params() {
    let new_url = window.location.toString().split('?')[0] + "?word=" + encodeURIComponent(word_search.value) + "&kanji=" + encodeURIComponent(kanji_search.value);
    window.history.replaceState(null, '', new_url);
}

function set_word(name) {
    if (word_search.value != name) {
        word_search.value = name;
    }
    let new_word = all_words[name];
    if (!new_word) {
        word_search.classList.add('search_fail');
        return false;
    }
    set_search_params();
    if (dmak_area != null) {
        dmak_area.innerHTML = '';
    }
    dmak = new Dmak(name, {
        'element' : "dmak_area",
        'uri': "https://portfolio.trifuse.xyz/kanjivg/kanji/",
        'autoplay': false,
        'step': 0.01
    });
    word.innerHTML = '';
    translation.innerText = new_word.translation;
    for (const kanji of new_word.word) {
        let kanji_node = document.createElement('a');
        kanji_node.className = "clickable";
        kanji_node.innerText = kanji[0];
        kanji_node.addEventListener('click', ((k) => {
            return () => {
                set_kanji(k);
            };
        })(kanji[0]));
        word.appendChild(kanji_node);
        if (kanji.length == 2) {
            let reading = document.createElement('rt');
            reading.innerText = kanji[1];
            word.appendChild(reading);
        }
    }
    word_search.classList.remove('search_fail');
    return true;
}
function set_kanji(name) {
    if (kanji_search.value != name) {
        kanji_search.value = name;
    }
    function add_reading(content, reading, vocab_words) {
        let heading = document.createElement('h1');
        heading.innerText = reading;
        content.appendChild(heading);
        if (vocab_words.length > 0) {
            let vocab = document.createElement('div');
            vocab.className = 'vocab';
            for (vocab_word of vocab_words) {
                let vocab_word_node = document.createElement('span');
                vocab_word_node.className = 'word';
                vocab_word_node.innerText = vocab_word;
                vocab_word_node.addEventListener('click', ((v) => {
                    return () => {
                        set_word(v);
                    };
                })(vocab_word));
                vocab.appendChild(vocab_word_node);
            }
            content.appendChild(vocab);
        }
    }
    let new_kanji = all_kanji[name];
    if (!new_kanji) {
        kanji_search.classList.add('search_fail');
        return false;
    }
    set_search_params();
    kanji.innerHTML = '';
    kanji.innerText = name;
    if (new_kanji.meaning != null) {
        meaning_heading.classList.remove('hidden');
        meaning.classList.remove('hidden');
        meaning.innerText = new_kanji.meaning;
    } else {
        meaning_heading.classList.add('hidden');
        meaning.classList.add('hidden');
    }
    if ('reading' in new_kanji) {
        let reading = document.createElement('rt');
        reading.innerText = new_kanji.reading;
        kanji.appendChild(reading);
    }
    const reading_types = ["onyomi", "kunyomi", "other_reading"];
    for (reading_type of reading_types) {
        let content = document.getElementById(reading_type + '_content');
        content.innerHTML = '';
        for (reading in new_kanji[reading_type]) {
            let vocab_words = new_kanji[reading_type][reading];
            add_reading(content, reading, vocab_words);
        }
    }
    kanji_search.classList.remove('search_fail');
    return true;
}