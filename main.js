// 全角->半角(英数字)
function toNarrow(str) {
    return str.replace(/　/g, ' ').replace(/[！-～]/g, function(s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });
}

function convert() {
    const text = document.getElementById("schedule").value;
    if (text == "") {
        alert("練習日程を入力してください。");
        return;
    }

    let result = "";
    
    // 各行毎に処理する
    const lines = text.split('\n');
    for (let line of lines) {
        // ex) 8/31(木)宝(2) 18-21

        // 半角に変換
        let str = toNarrow(line);

        // スペースを削除
        str = str.replace(/ /g, '');

        // 日付を抽出する
        let dateText = str.match(/(\d{1,2})\/(\d{1,2})/);
        if (dateText == null) {
            continue;
        }
        let month = Number(dateText[1]);
        let day = Number(dateText[2]);

        let now = new Date();
        let date = new Date(now.getFullYear(), month-1, day);

        // [-3m, 9m] の範囲に収まるようにする
        let date2 = now;
        date2.setMonth(now.getMonth() - 3);
        if (date.getTime() < date2.getTime()) {
            date.setFullYear(date.getFullYear() + 1);
        }
        else {
            date2.setMonth(now.getMonth() + 9);
            if (date.getTime() > date2.getTime()) {
                date.setFullYear(date.getFullYear() - 1);
            }
        }

        // 曜日を抽出する
        let dayText = str.match(/\(([日月火水木金土])\)/);
        if (dayText != null) {
            let dayOfWeek = ["日","月","火","水","木","金","土"].indexOf(dayText[1]);
            // 曜日が合っているか確認
            if (date.getDay() != dayOfWeek) {
                alert(`${date.getFullYear()}年${date.getMonth()+1}月${date.getDate()}日は${dayText[1]}曜日ではありません。`)
            }
        }

        // コート番号を抽出する
        var numberText = str.match(/[\u2460-\u2473]/);
        if (numberText != null) {
            numberText = numberText[0];
        }
        else {
            numberText = "？"
        }

        // 時刻を抽出する
        let timeText = str.match(/(\d{1,2})-(\d{1,2})/);
        if (timeText == null) {
            continue;
        }
        let startTime = Number(timeText[1]);
        let endTime = Number(timeText[2]);
        // 06 など 0 が入っていれば午前と解釈する
        if (timeText[1][0] != '0') {
            // 7 以下なら午後
            if (startTime <= 7) {
                startTime += 12;
            }
        }
        if (timeText[2][0] != '0') {
            // 9 以下なら午後
            if (endTime <= 9) {
                endTime += 12;
            }
        }
        if (startTime >= endTime) {
            // 開始時刻は午前，終了時刻は午後と解釈
            if (startTime >= 12) {
                startTime -= 12;
            }
            if (endTime < 12) {
                endTime += 12;
            }
        }

        // 場所を抽出する
        let location = "";
        let locationName = "";
        let list = [
            ["岡", "岡崎", "岡崎公園テニスコート"],
            ["宝", "宝", "宝ヶ池公園テニスコート"],
            ["御", "御所", "京都御苑テニスコート"],
            ["向", "向島", "HOS向島テニスコート"],
            ["勧", "勧修寺", "勧修寺公園テニスコート"],
            ["中", "中書島", "伏見港公園テニスコート"],
            ["丹", "丹波", "伏見北堀公園"],
        ];

        for (let loc of list) {
            if (new RegExp(loc[0]).test(str)) {
                location = loc[1];
                locationName = loc[2];
                break;
            }
        }

        if (location == "") {
            alert("不明なコートです: " + line);
            continue;
        }

        let startTimeText = startTime > 12 ? startTime - 12 : startTime;
        let endTimeText = endTime > 12 ? endTime - 12 : endTime;
        let title = `${location}${startTimeText}－${endTimeText} ${numberText}番コート`;

        result += `${date.getFullYear()},${date.getMonth()+1},${date.getDate()},${startTime},${endTime},${title},${locationName}`;
        result += "\n";
    }

    document.getElementById("result").value = result;
}
