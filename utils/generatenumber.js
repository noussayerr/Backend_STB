export const generateCardNumber=()=> {
    let cardNumber = '';
    for (let i = 0; i < 16; i++) {
        cardNumber += Math.floor(Math.random() * 10);
        if ((i + 1) % 4 === 0 && i !== 15) {
            cardNumber += ' ';
        }
    }
    return cardNumber;
}

export const generateRandomNumber=(length) =>{
    let result = '';
    for (let i = 0; i < length; i++) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
}