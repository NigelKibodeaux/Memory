const CONTAINER_CLASS = 'nigel-memory'

// Pure function that shuffles an array
function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue,
        randomIndex

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex)
        currentIndex -= 1

        // And swap it with the current element.
        temporaryValue = array[currentIndex]
        array[currentIndex] = array[randomIndex]
        array[randomIndex] = temporaryValue
    }

    return array
}

function createMemoryGame({ image_url_array, image_size, container_element }) {
    console.log(container_element.clientWidth, container_element.clientHeight)
    const padding = 5 // 5px of nothing should be around each card

    // Determine the maximum number of columns and rows that can fit in the container
    let maxCols = 1
    while (
        maxCols * (image_size + 2 * padding) + padding * 2 < container_element.clientWidth &&
        maxCols < image_url_array.length * 2
    ) {
        maxCols++
    }
    maxCols-- // go back to the last one that fit

    let maxRows = 1
    while (
        maxRows * (image_size + 2 * padding) + padding * 2 < container_element.clientHeight &&
        maxRows < image_url_array.length * 2
    ) {
        maxRows++
    }
    maxRows-- // go back to the last one that fit

    // Determine the maximum number of images (not cards) that can fit in the container
    let maxCards = Math.min(maxCols * maxRows, image_url_array.length * 2)
    if (maxCards % 2 == 1) maxCards-- // make sure it's even
    let maxPics = Math.floor(maxCards / 2)

    // Array of cards to be used in the game, limited to the maximum number of pictures
    let cards = [...image_url_array]
    // randomize the cards
    cards = shuffle(cards)
    // limit the number of cards
    cards = cards.slice(0, maxPics)
    // make 2 of each card
    cards = cards.concat(cards)
    // shuffle again
    cards = shuffle(cards)

    // create the card board
    const card_board = document.createElement('div')
    card_board.classList.add('nigel-memory')

    // use the fewest number of columns possible beyond square
    let adjustedCols = maxCols
    let adjustedRows = Math.ceil(maxCards / adjustedCols)

    // try lessening the number of columns by one to see if it fits
    let newCols = adjustedCols - 1
    let newRows = Math.ceil(maxCards / newCols)
    while (newRows < maxRows) {
        adjustedCols = newCols
        adjustedRows = newRows
        newCols--
        newRows = Math.ceil(maxCards / newCols)
        console.log({ adjustedCols, adjustedRows, newCols, newRows })
    }

    // style the container to center the card board
    container_element.style.display = 'flex'
    container_element.style.justifyContent = 'center'
    container_element.style.alignItems = 'center'

    // add styles to the page
    var style = document.createElement('style')
    style.innerHTML = `
        .${CONTAINER_CLASS} {
            display: grid;
            grid-template-columns: repeat(${adjustedCols}, ${image_size + padding * 2}px);
            grid-template-rows: repeat(${adjustedRows}, ${image_size + padding * 2}px);
            place-items: center;
            padding: ${padding}px;
            margin: 0;
        }

        .${CONTAINER_CLASS} .card {
            background-color: rgb(70, 72, 74);
            background-repeat: no-repeat;
            width: ${image_size}px;
            height: ${image_size}px;
            background-position: ${image_size}px;
            background-size: cover;
        }
        .${CONTAINER_CLASS} .front,
        .${CONTAINER_CLASS} .matched {
            background-position: 0px;
        }
    `
    document.head.appendChild(style)

    cards.forEach(function (o) {
        var card = document.createElement('div')
        card.classList.add('card')
        card.style.backgroundImage = 'url(' + o + ')'

        card_board.appendChild(card)
    })

    container_element.appendChild(card_board)

    let clearTimer = null // used to clear the timer if a match is found
    function clickHandler(event) {
        var card = false
        if (event.srcElement.classList.contains('card')) card = event.srcElement

        if (card) {
            // find other turned-over cards
            const otherCards = container_element.querySelectorAll('.front')

            // first card turned over
            if (otherCards.length == 0) {
                // turn card over
                card.classList.add('front')
            }
            // second card turned over
            else if (otherCards.length == 1 && otherCards[0] != card) {
                var otherCard = otherCards[0]
                var match = card.style.backgroundImage == otherCard.style.backgroundImage

                if (match) {
                    card.classList.remove('front')
                    card.classList.add('matched')
                    otherCard.classList.remove('front')
                    otherCard.classList.add('matched')

                    // check for game over
                    if (
                        container_element.querySelectorAll(`.${CONTAINER_CLASS} .matched`).length ==
                        container_element.querySelectorAll(`.${CONTAINER_CLASS} .card`).length
                    ) {
                        const messages = ['You won!']
                        if (maxPics < image_url_array.length)
                            messages.push('Refresh the page for a new assortment of pictures.')
                        else messages.push('Refresh the page to play again.')

                        alert(messages.join('\n'))
                    }
                } else {
                    // turn card over
                    card.classList.add('front')

                    clearTimer = setTimeout(hideAllUnmatched, 1500)
                }
            }
            // third card clicked while 2 are shown
            // or second clicked twice
            else {
                if (clearTimer) clearTimeout(clearTimer)

                // see if the 2nd and 3rd cards match
                const match = Array.from(otherCards).find(
                    (c) => c != card && c.style.backgroundImage == card.style.backgroundImage,
                )
                if (match) {
                    card.classList.remove('front')
                    card.classList.add('matched')
                    match.classList.remove('front')
                    match.classList.add('matched')
                }

                hideAllUnmatched()
                // turn this card over
                card.classList.add('front')
            }
        }
    }

    container_element.addEventListener('click', clickHandler, false)
    container_element.addEventListener('touchstart', clickHandler, false)

    function hideAllUnmatched() {
        var cards = container_element.querySelectorAll(`.${CONTAINER_CLASS} .front`)
        for (i = 0; i < cards.length; i++) {
            card = cards[i]
            card.classList.remove('front')
        }
    }
}
