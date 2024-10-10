// 全角->半角(英数字)
function toNarrow(str) {
	return str.replace(/　/g, " ").replace(/[！-～]/g, function (s) {
		return String.fromCharCode(s.charCodeAt(0) - 0xfee0);
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
	const lines = text.split("\n");
	for (let line of lines) {
		// ex) 8/31(木)宝(2) 18-21

		// 半角に変換
		let str = toNarrow(line);

		// 日付を抽出する
		let dateText = str.match(/([01]?\d)\/([0123]?\d)/);
		if (dateText == null) {
			dateText = str.match(/([01]?\d)月([0123]?\d)日/);
			if (dateText == null) {
				continue;
			}
		}
		// 以降のマッチは日付の後ろから行う
		str = str.substr(dateText.index);

		let month = Number(dateText[1]);
		let day = Number(dateText[2]);

		let now = new Date();
		let date = new Date(now.getFullYear(), month - 1, day);

		// [-3m, 9m] の範囲に収まるようにする
		let date2 = now;
		date2.setMonth(now.getMonth() - 3);
		if (date.getTime() < date2.getTime()) {
			date.setFullYear(date.getFullYear() + 1);
		} else {
			date2.setMonth(now.getMonth() + 9);
			if (date.getTime() > date2.getTime()) {
				date.setFullYear(date.getFullYear() - 1);
			}
		}

		// 曜日を抽出する
		let dayText = str.match(/\(([日月火水木金土])\)/);
		if (dayText != null) {
			let dayOfWeek = "日月火水木金土".indexOf(dayText[1]);
			// 曜日が合っているか確認
			if (date.getDay() != dayOfWeek) {
				alert(
					`${date.getFullYear()}年${
						date.getMonth() + 1
					}月${date.getDate()}日は${dayText[1]}曜日ではありません。`
				);
			}
		}

		// コート番号を抽出する
		var numberText = str.match(/[\u2460-\u2473]/);
		if (numberText != null) {
			numberText = numberText[0];
		} else {
			numberText = str.match(/\((\d{1,2})\)/);
			if (numberText != null) {
				numberText = numberText[1];
			} else {
				numberText = "？";
			}
		}

		// 時刻を抽出する
		let timeText = str.match(/([012]?\d)-([012]?\d)/);
		if (timeText == null) {
			continue;
		}
		let startTime = Number(timeText[1]);
		let endTime = Number(timeText[2]);

		// 午前・午後を明示しているか
		let startExplicit = false;
		let endExplicit = false;
		// 06 など 0 が入っていれば午前と解釈する
		if (timeText[1][0] != "0") {
			// 7 以下なら午後
			if (startTime <= 7) {
				startTime += 12;
			} else if (startTime > 12) {
				startExplicit = true;
			}
		} else {
			startExplicit = true;
		}
		if (timeText[2][0] != "0") {
			// 9 以下なら午後
			if (endTime <= 9) {
				endTime += 12;
			} else if (endTime > 12) {
				endExplicit = true;
			}
		} else {
			endExplicit = true;
		}

		if (startTime >= endTime) {
			// 開始時刻は午前，終了時刻は午後と解釈
			if (startExplicit && endExplicit) {
				alert("開始時刻は終了時刻よりも前でなければなりません: " + line);
				continue;
			}
			if (startExplicit) {
				if (endTime < 12) {
					endTime += 12;
				}
				if (startTime >= endTime) {
					alert("開始時刻は終了時刻よりも前でなければなりません: " + line);
					continue;
				}
			} else if (endExplicit) {
				if (startTime >= 12) {
					startTime -= 12;
				}
				if (startTime >= endTime) {
					alert("開始時刻は終了時刻よりも前でなければなりません: " + line);
					continue;
				}
			} else {
				if (startTime >= 12) {
					startTime -= 12;
				}
				if (startTime >= endTime) {
					if (endTime < 12) {
						endTime += 12;
					}
					if (startTime >= endTime) {
						alert("開始時刻は終了時刻よりも前でなければなりません: " + line);
						continue;
					}
				}
			}
		}

		// 場所を抽出する
		let location = "";
		let locationName = "";
		let list = [
			["岡", "岡", "岡崎公園テニスコート"],
			["宝", "宝", "宝ヶ池公園テニスコート"],
			["御", "御所", "京都御苑テニスコート"],
			["向", "向島", "HOS向島テニスコート"],
			["勧", "勧修寺", "勧修寺公園テニスコート"],
			["丹", "丹波", "丹波橋テニスコート"],
			["桂", "桂", "京都大学 桂キャンパステニスコート"],
			["西", "西院", "西院公園テニスコート"],
			["[中伏]", "中書島", "伏見港公園テニスコート"],
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

		result += `${date.getFullYear()},${
			date.getMonth() + 1
		},${date.getDate()},${startTime},${endTime},${title},${locationName}`;
		result += "\n";
	}

	document.getElementById("result").value = result;
}
