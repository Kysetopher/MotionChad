const scrambleCharacters = "⌽⌾⍋⍎⍕⍝⍡⍢⍨⍫⍬⍭⍱⍲؁هڇڈڦڱ۞۩ݓﮖԽՀՊՋդխտփ֍֏᭢᭨᭶᭻ᯓᯣᯤᯥ᯼᯽᯾অআঌখঝতদনয়ৡৰㄅㄆㄓㄞㆣᨊᨎᨏᝂᝄᝉᝌᝎᝏᝐᐂᐄᐇᐉᐐᐒᐲᎦᎨᏜᏫϪⲀⲆⲊⲬⲯⲴⲸⲾⳔⳖⳚⳜ⳩ⳭЖѦ҂ҜӾሽቃቜቲቹቻቾኀኈኍኤእዥጬጷፈ፠፨፹ⰀⰇⰔⰖⰗⰛⰡⰳⰿⱉⱔまやりをゟᠥᚡᚯᚳᚸᚼᛀᛄᛤ᛭ᛯᮻ᳀᳂༁༄༆༒ⵅ";

export function scrambleText(input, duration) {
  return new Promise((resolve) => {
    const originalText = input.value;
    const length = originalText.length;
    const scrambledText = originalText.split("");
    const scrambleIntervals = [];
    const originalTotal = 50 * length + 250;
    const scale = duration / originalTotal;
    const SCRAMBLE_REFRESH_MS = 15;
    function startScramble(index) {
      scrambleIntervals[index] = setInterval(() => {
        scrambledText[index] =
          scrambleCharacters[Math.floor(Math.random() * scrambleCharacters.length)];
        input.value = scrambledText.join("");
      }, SCRAMBLE_REFRESH_MS);
    }
    function stopScramble(index) {
      clearInterval(scrambleIntervals[index]);
      scrambledText[index] =
        scrambleCharacters[Math.floor(Math.random() * scrambleCharacters.length)];
      input.value = scrambledText.join("");
    }

    for (let i = 0; i < length; i++) {
      const startTime = i * 50 * scale;
      const stopTime = (i * 50 + 200) * scale;

      setTimeout(() => startScramble(i), startTime);
      setTimeout(() => stopScramble(i), stopTime);
    }

    const finalTime = (length * 50 + 250) * scale;
    setTimeout(() => {
      input.value = "";
      resolve();
    }, finalTime);
  });
}