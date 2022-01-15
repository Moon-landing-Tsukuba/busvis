/*-------------------------------------------
*管理クラスAdministrator
-------------------------------------------*/

const administrator = {
  direction: true, //右回りならTrue
  user_station: 12, //バス停の識別IDが入る
  target_table: [],
  buses: [],
  holiday: false, //休日ならばtrue
  correct_holiday : false,
  bus_stop_select_mode : false, //バス停選択時true
  bus_select_mode : false, //バス選択時true
  selected_bus_id : 100, //選択されているバスのID
  next_bus : null, //待機中のバスインスタンス
  next_timetable : [], //next_busが参照しているタイムテーブル
  remaining_time : 0,
  switch : false,
};

/*-------------------------------------------
*ボタンクリック等のイベント
-------------------------------------------*/
document.querySelector(".switch-left-right").addEventListener("click", (event) => {
  event.target.classList.toggle("on")
  if (event.target.classList.contains("on")) {
    administrator.direction = true;// alert("right");
  } else {
    administrator.direction = false;// alert("left");
  }
  decide_timetable(administrator);
  administrator.switch = true;
  console.log(administrator);
})

document.querySelector(".switch-holiday-weekday").addEventListener("click", (event) => {
  event.target.classList.toggle("weekday")
  if (event.target.classList.contains("weekday")) {
    administrator.holiday = false;// alert("holiday = false");
  } else {
    administrator.holiday = true;// alert("holiday = true");
  }
  decide_timetable(administrator);
  administrator.switch = true;
  console.log(administrator);
})

const reactions = document.querySelectorAll(".reaction-item");
reactions.forEach(reaction => {
  reaction.addEventListener("click", () => {
    let late = reaction.dataset.late;
    let id = 7;
    let direction;
    if (administrator.direction) {
      direction = 'rights';
    } else {
      direction = 'lefts';
    }
    // alert("late : " + late + " - id : " + id + " - direction : " + direction);

    if(administrator.correct_holiday == administrator.holiday){
      fetch('index.php', {
        method: 'POST',
        body: new URLSearchParams({
          fetchid: id,
          direct: direction,
          latetime: late,
        })
      });
    }
    alert("id : " + id + " - direction : " + direction + " - latetime : " + late);
  });
})

document.querySelector(".change-bus-stop").addEventListener("click", (event) => {
  event.target.classList.toggle("on-stop")
  if (event.target.classList.contains("on-stop")) {
    administrator.bus_stop_select_mode = true;// alert("bus_stop_select_mode = true");
  } else {
    administrator.bus_stop_select_mode = false;// alert("bus_stop_select_mode = false");
  }
  console.log(administrator);
})

document.querySelector(".change-bus").addEventListener("click", (event) => {
  event.target.classList.toggle("on-bus")
  if (event.target.classList.contains("on-bus")) {
    administrator.bus_select_mode = true;// alert("bus_select_mode = true");
  } else {
    administrator.bus_select_mode = false;// alert("bus_select_mode = false");
  }
  console.log(administrator);
})


/*-------------------------------------------
*変数定義パート
*bus_stop_num : バス停の数
*bus_stop_names : 各バス停の名前
*bus_stop_positions : バス停の位置情報を格納
*timetable : バスの時刻表(仮)
*stops : バス停インスタンス <-- render部分で毎回新たに生み出すのが無駄であるため
*ctx : Canvasの描画部
-------------------------------------------*/

const bus_stop_num = 28;

const bus_stop_names = ["つくばセンター", "吾妻小学校前", "筑波大学春日キャンパス", "筑波メディカルセンター前", "筑波大学病院入口", "追越学生宿舎前", "平砂学生宿舎前", "筑波大学西", "大学会館前", "第一エリア前", "第三エリア前", "陸域環境研究センター前", "農林技術センター前", "一の矢学生宿舎前", "大学植物見本園", "TARAセンター前", "筑波大学中央", "大学公演", "松実池", "天久保三丁目", "合宿所", "天久保池", "天久保二丁目", "追越宿舎東", "筑波メディカルセンター病院", "筑波メディカルセンター前", "筑波大学春日キャンパス", "吾妻小学校前", "つくばセンター"]
const bus_stop_latlng = [[36.082537, 140.112707], [36.085158, 140.109299], [,], [,], [,], [,], [,], [,], [,], [,], [,], [,], [,], [,], [,], [,], [,], [,], [36.108121, 140.104282], [36.106372, 140.105679], [36.103688, 140.106732], [36.100184, 140.105618], [36.097574, 140.106049], [36.094516, 140.106743], [36.092658, 140.106397]]

let timetable = timetable_list[0]

const holiday_list = [
  '2022-1-1',
  '2022-1-10',
  '2022-2-11',
  '2022-2-23',
  '2022-3-21',
  '2022-4-29',
  '2022-5-3',
  '2022-5-4',
  '2022-5-5',
  '2022-7-18',
  '2022-8-11',
  '2022-9-19',
  '2022-9-23',
  '2022-10-10',
  '2022-11-3',
  '2022-11-23',
]

var cvs = document.getElementById("bus-map");
const w = cvs.clientWidth;
const h = w;
cvs.width = w;
cvs.height = h;
var ctx = cvs.getContext("2d");

const bus_stop_positions = make_position(); //canvas上の位置

let stops = [];
for (i = 0; i < bus_stop_num; i++) {
  const stop = new Stop(i);
  stops.push(stop);
}


console.log(cvs.clientWidth);

/*-------------------------------------------
*オブジェクト定義パート
*Bus :
*Stop :  
-------------------------------------------*/

function Bus(id) {
  var me = this;
  this.id = id;
  this.timetable = [];
  this.start_stop = 0;
  this.end_stop = 0;
  this.start_time = 0;
  this.end_time = 0;
  this.remaining_time = 0;
  this.position_x = 0;
  this.position_y = 0;
  this.size = w / 50 * 3;
  this.is_clicked = false;

  this.draw = function (ctx, x, y) {
    ctx.lineWidth = w / 250;
    
    if(administrator.selected_bus_id === me.id){
      ctx.fillStyle = "#FF5F76";
    }else{
      ctx.fillStyle = "#32A9C2";
    }

    ctx.beginPath();
    ctx.strokeStyle = "#fff";
    ctx.moveTo(x - this.size / 3, y - this.size / 3);
    ctx.lineTo(x + this.size / 3, y - this.size / 3);
    ctx.lineTo(x + this.size / 3, y + this.size / 3);
    ctx.lineTo(x - this.size / 3, y + this.size / 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
  };

  window.addEventListener("mousedown", function (e) {
    var dx = me.position_x - e.layerX;
    var dy = me.position_y - e.layerY;
    me.is_clicked = Math.sqrt(dx * dx + dy * dy) < me.size;
    if (administrator.bus_select_mode){  //バス変更ボタンが押されている＆どこかのバスがクリックされたら切り替え
      if (me.is_clicked) {
        //if(administrator.buses.length >= 2){
          console.log("bus clicked");
          administrator.selected_bus_id = me.id;
          administrator.bus_select_mode = false;
          document.querySelector(".change-bus").classList.remove("on-bus");
        //}
      }
    }
  });
}

function Stop(id) {
  var me = this;
  var [x, y] = bus_stop_positions[id];
  this.id = id;
  this.size = w / 50;
  this.remaining_time = 0;
  this.is_clicked = false;
  this.name = bus_stop_names[id];
  this.change_color = "#32A9C2"; //バス停変更ボタンが押された場合の色
  this.selected_color = "#FF5F76"; //ユーザーが選択しているバス停の色
  this.default_color = "#fff"; //デフォルトのバス停の色
  this.stroke_color = "#32A9C2"; //バス停のstrokeStyleの色

  this.draw = function (ctx) {
    ctx.lineWidth = w / 250;
    ctx.beginPath();
    if(administrator.bus_stop_select_mode){ //バス停選択ボタンが押されている場合、バス停の色を変える。
      ctx.fillStyle = me.change_color;
      if (administrator.user_station === id) {
        ctx.fillStyle = me.selected_color;
      }
    }else{
      if (administrator.user_station === id) {
        ctx.fillStyle = me.selected_color;
      } else {
        ctx.fillStyle = me.default_color;
      }
    }
    ctx.strokeStyle = me.stroke_color;
    // console.log(me.size);
    ctx.moveTo(x + me.size, y);
    ctx.arc(x, y, me.size, 0, 2 * Math.PI, true);
    ctx.fill();
    ctx.stroke();

    if(administrator.bus_stop_select_mode){
      ctx.fillStyle = "black";
      ctx.font = "italic bold 10pt sans-serif";
      ctx.fillText(me.name, x, y);
      ctx.stroke();
    }
  };
  
  window.addEventListener("mousedown", function (e) {
    var dx = x - e.layerX;
    var dy = y - e.layerY;
    me.is_clicked = Math.sqrt(dx * dx + dy * dy) < me.size;
    if(administrator.bus_stop_select_mode){  //バス停変更ボタンが押されている＆どこかのバス停がクリックされたら切り替え
      if (me.is_clicked) {
        administrator.user_station = me.id;
        administrator.bus_stop_select_mode = false;
        document.querySelector(".change-bus-stop").classList.remove("on-stop");

        // -----------Ajaxを記述. バスの遅延時間を取得.---------
        // let direction;
        // if (administrator.direction) {
        //   direction = 'rights';
        // } else {
        //   direction = 'lefts';
        // }

        // var req = new XMLHttpRequest();
        // req.open('POST', 'index.php', true);
        // req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        // req.send("id=" + administrator.user_station + "&direction=" + direction);
        // req.onreadystatechange = function () {
        //   var result = document.getElementById('result');
        //   if (req.readyState == 4) { // 通信の完了時
        //     if (req.status == 200) { // 通信の成功時
        //       result.innerHTML = req.responseText;
        //     }
        //   } else {
        //     result.innerHTML = "通信中...";
        //   }
        // }
      }
    }
  });
}



// これら機能を一括して行う関数を作成する必要あり。
/*------------------------------------------
*関数定義パート
*load_now : 現在時刻を表示 | 返り値例 : 183010
*check_table : 現在時刻から運行しているバスのtimetableを取得(複数個ある可能性あり)＆administratorに代入
*create_buses : chek_tableで取得したtimetableをもとに運行しているバスのインスタンスを作成
*calc_bus_param : 運行中のバス情報をインスタンスに反映させる
*calc_pos : administratorの中の各バスが「画面上の」どこに居るかを計算
*calc_remaining_time : あと何分でユーザーが選択したバス停にバスインスタンスが到着するのかを計算
*decide_timetable : adiministratorのholidayとdirectionの値からtimetableを決定する。
*check_holiday : 祝日または休日ならadministratorのholidayをtrueとする関数。
*render : 描画関数
------------------------------------------*/
function load_now() {
  let now = new Date();
  let hour = now.getHours();
  let min = now.getMinutes();
  let sec = now.getSeconds();
  let time = hour * 10000 + min * 100 + sec;  //秒の仕様を後で確認する。
  return time;
}

function check_table() {
  let now = load_now();
  const table = [];
  let next_table;
  let ID;

  //まずfor文により、現在運行中のバスがあるかを確認する。
  for (i = 0; i < timetable.length; i++) {
    if (timetable[i][0] <= now && now <= timetable[i][27]) {
      table.push(timetable[i]);
    }
  }

  //運行中のバスがあるならば、そのバスをもとにnext_tableを決める
  if(table.length != 0){
    table.forEach(function (value, index) {
      for(var i = 0;i < timetable.length;i++){
        if(timetable[i][0] == value[0]){
          ID = i;
          break;
        }
      }
    });

    if(ID != timetable.length - 1){
      next_table = timetable[ID+1];
    }else{
      next_table = timetable[0];
    }
  }

  //そして、運行中のバスがなかった場合、待機中のバスがあるかどうかを確認する。
  if(table.length === 0 && timetable[0][0] <= now && now <= timetable[timetable.length - 1][27]){
    for (var i = 0; i < timetable.length - 1; i++) {
      if (timetable[i][0] <= now && now <= timetable[i+1][0]) {
        next_table = timetable[i+1];
      }
    }  
  }

  //待機中のバスがなかった場合、翌日の始発をnext_tableとする。
  if(table.length === 0 && now < timetable[0][0] && timetable[timetable.length - 1][27] < now){ 
    next_table = timetable[0];
  }

  administrator.target_table = table;
  administrator.next_timetable = next_table;
}

function create_buses(tm) {  //tm : administrater.target_table
  const buses = [];
  var ID = timetable.length;
  tm.forEach(function (value, index) {
    
    for(var i = 0;i < timetable.length;i++){
      if(timetable[i][0] == value[0]){
        ID = i;
        // console.log(ID);
        break;
      }
    }

    const bus = new Bus(ID);

    bus.timetable = value;
    buses.push(bus);
  });

  administrator.buses = buses;
  
  // next_busを作成
  const next_bus =  new Bus(100);
  next_bus.timetable = administrator.next_timetable; // timetable[ID+1]
  administrator.next_bus = next_bus; 
}


// この関数はバスのパラメーターを時々刻々と更新しているので、render関数内で実行する必要がありそう。
function calc_bus_param(admin_bus) { // admin_bus : administrator.buses
  let now = load_now(); // ex)163033

  admin_bus.forEach(function (value, index) {
    const target_ends = [];
    value.timetable.forEach(function (element) {
      element = element;
      if (element > now) {
        target_ends.push(element);
      }
    });
    const target_end = target_ends[0];

    let target_start = 0;
    value.timetable.forEach(function (element) {
      element = element;
      if (element < target_end) {
        target_start = element;
      }
    });

    let start_stop = 0;
    value.timetable.some(function (time, index) {
      if (target_start == time) {
        start_stop = index;
        return true;
      }
    });

    let end_stop = 0;
    value.timetable.some(function (time, index) {
      if (target_end == time) {
        end_stop = index;
        return true;
      }
    });

    value.start_stop = start_stop;
    value.end_stop = end_stop;
    value.start_time = target_start;
    value.end_time = target_end;
  });
}

function calc_pos(admin) {
  var stopps; // ここ変更が更新されていない。

  if (admin.direction) {//おそらくここはバスの左右で条件分岐している。  
    stopps = bus_stop_positions;
  } else {
    stopps = bus_stop_positions.slice().reverse();
  }

  let now = load_now();
  admin.buses.forEach(function (bus, index) {
    const total_time = bus.end_time - bus.start_time;
    const propotion = (now - bus.start_time) / total_time / 0.6;
    const start_stop = stopps[bus.start_stop];
    const end_stop = stopps[bus.end_stop];
    const x = start_stop[0] + (end_stop[0] - start_stop[0]) * propotion; // <-- ここマイナスとかあるからもう少し考えた方が
    const y = start_stop[1] + (end_stop[1] - start_stop[1]) * propotion; //     良さげ。
    bus.position_x = x;
    bus.position_y = y;
  });
}

function decide_timetable(adm) {
  if (adm.direction && !adm.holiday) { //平日・右回り// alert("平日・右回り");
    timetable = timetable_list[0];
  } else if (!adm.direction && !adm.holiday) {//平日・左回り// alert("平日・左回り");
    timetable = timetable_list[1];
  } else if (adm.direction && adm.holiday) {//休日・右回り// alert("休日・右回り");
    timetable = timetable_list[2];
  } else if (!adm.direction && adm.holiday) {//休日・左回り// alert("休日・左回り");
    timetable = timetable_list[3];
  }
}

function check_holiday() {
  const dateOBJ = new Date();
  const year = dateOBJ.getFullYear();
  const month = dateOBJ.getMonth() + 1;
  const date = dateOBJ.getDate();
  const day = dateOBJ.getDay();
  const today = year + '-' + month + '-' + date;

  if (holiday_list.includes(today) || day == 0 || day == 6) {
    administrator.holiday = true;
    administrator.correct_holiday = true;
    document.querySelector(".switch-holiday-weekday").classList.remove("weekday");
  } else {
    administrator.holiday = false;
    administrator.correct_holiday = false;
    document.querySelector(".switch-holiday-weekday").classList.add("weekday");
  }
}

function selected_bus_id_initialized(){
  const now = load_now();
  const userStation = administrator.user_station;
  const buses = administrator.buses;
  let candidate_time = [];
  let count = 0;

  if(buses.length === 0){
    administrator.selected_bus_id = 100;
  }else{
    buses.some(function(value, index){
      candidate_time.push(value.timetable[userStation]);
    });

    console.log(candidate_time);

    candidate_time.some(function(value, index){
      if(now > value) count = count + 1;
    });

    if(count === administrator.buses.length){
      administrator.selected_bus_id = 100;
    }else{
      administrator.selected_bus_id = administrator.buses[count].id;
    }
  }
  console.log("count : " + count);
  console.log("selectedID : " + administrator.selected_bus_id);
}

function calc_remaining_time(adm){
  const now = load_now();
  let userStation = adm.user_station;
  const bus_id = adm.selected_bus_id;
  let arrivalTime;

  if(!adm.direction){ //左回りの場合の値
    if(userStation == 28){
      userStation = 0;
    }else{
      userStation = timetable[0].length - userStation - 1; 
    }
  }

  if(bus_id === 100){
    arrivalTime = administrator.next_timetable[userStation];
  }else{
    arrivalTime = timetable[bus_id][userStation]
  }

  const now_hour = Math.floor(now/10000);
  const now_min = Math.floor(now/100) - now_hour*100;
  const now_sec = now - now_hour*10000 - now_min*100;
  const tgt_hour = Math.floor(arrivalTime/10000);
  const tgt_min = Math.floor(arrivalTime/100) - tgt_hour*100;
  const tgt_sec = arrivalTime - tgt_hour*10000 - tgt_min*100;
  const now_time = now_hour*3600 + now_min*60 + now_sec; //現在時刻を秒で表現

  const tgt_time = tgt_hour*3600 + tgt_min*60 + tgt_sec; //到着時刻を秒で表現
  
  const arrival = tgt_time - now_time;

  const arrival_min = Math.floor(arrival/60);
  const arrival_sec = arrival - arrival_min*60;

  administrator.remaining_time = arrival_min + "分" + arrival_sec + "秒";
}



function render() {
  // console.log(administrator);
  ctx.clearRect(0, 0, w, h);

  //map
  if(!administrator.bus_stop_select_mode){
    var r = h / 10
    ctx.lineWidth = w / 50;
    ctx.strokeStyle = "#32A9C2";
    ctx.beginPath();
    ctx.moveTo(w / 2 - h / 5, h - 2 * h / 10);
    ctx.lineTo(w / 2 - h / 5, h / 10);
    //ctx.arc(中心座標x, 中心座標y, 半径, 開始角, 終了角, 反時計回りか？); 3時〜12時の位置 ctx.arc(320, 120, 80, 0, 1.5 * Math.PI);
    //開始角は3時の方角で時計回り
    // ctx.arc(w/2-h/5+r, h/5, r, Math.PI, 3*Math.PI/2, false);
    ctx.lineTo(w / 2 + h / 5, h / 10);
    ctx.lineTo(w / 2 + h / 5, h - 2 * h / 10);
    ctx.lineTo(w / 2 - h / 5, h - 2 * h / 10);
    ctx.stroke();
  }

  //停留所インスタンスの生成
  for (var i = 0; i < bus_stop_num; i++) {
    stops[i].draw(ctx);
  }

  check_table();
  create_buses(administrator.target_table);
  calc_bus_param(administrator.buses);
  calc_pos(administrator);
  //[remaining_times,departure_times] = calc_remaining_time(administrator);
  if(administrator.switch){
    selected_bus_id_initialized();
    administrator.switch = false;
  }
  calc_remaining_time(administrator);

  ctx.fillStyle = "black";
  ctx.font = "italic bold 5pt sans-serif";
  const rem = administrator.remaining_time
  //const dep =departure_times[0];
  //ctx.fillText(dep, w/2-5*rem.length,h/2-20);
  ctx.fillText(rem, w/2-5*rem.length,h/2);

  administrator.buses.forEach(function (bus, index) {
    bus.draw(ctx, bus.position_x, bus.position_y);
  });
  administrator.next_bus.position_x = w / 2 - h / 4;
  administrator.next_bus.position_y = h -  2* h / 10;
  administrator.next_bus.draw(ctx,w / 2 - h / 4,h -  2* h / 10);
  // console.log(administrator);
}

function zfill(NUM, LEN) {
  return (Array(LEN).join('0') + NUM).slice(-LEN);
}

function make_position() {
  const positions = [];
  for (var i = 0; i < 29; i++) {
    var pos = [0, 0];
    if (i < 11) {
      pos[0] = w / 2 - h / 5;  
      pos[1] = h - 2 * h / 10 - 3.5 * h / 50 * i;
    } else if (i < 14) {
      pos[0] = w / 2 - h / 10 + h / 10 * (i - 11);
      pos[1] = h / 10;
    } else if (i < 25) {
      pos[0] = w / 2 + h / 5
      pos[1] = 2 * h / 10 - 3 / 100 * h + 3.5 * h / 50 * (i - 15);
    } else {
      pos[0] = w / 2 + h / 10 - h / 10 * (i - 25);
      pos[1] = h - 2 * h / 10;
    }
    positions.push(pos);
  }

  return positions;
}

const transpose = a => a[0].map((_, c) => a.map(r => r[c]));


function displayData(lat, lng, accu) {
  var txt = document.getElementById("gps");       // データを表示するdiv要素の取得
  txt.innerHTML = "緯度, 経度: " + lat + ", " + lng + "<br>"  // データ表示
    + "精度: " + accu;
}

/*-------------------------------------------
*実行パート
-------------------------------------------*/

check_holiday();
decide_timetable(administrator);
check_table();
create_buses(administrator.target_table);
calc_bus_param(administrator.buses);
calc_pos(administrator);
selected_bus_id_initialized();
//[remaining_times,departure_times] = calc_remaining_time(administrator);
calc_remaining_time(administrator);
render();

setInterval(render, 30);

navigator.geolocation.watchPosition((position) => {
  var lat = position.coords.latitude;            // 緯度を取得
  var lng = position.coords.longitude;           // 経度を取得
  var accu = position.coords.accuracy;            // 緯度・経度の精度を取得
  displayData(lat, lng, accu);                    // displayData 関数を実行
}, (error) => {                                     // エラー処理（今回は特に何もしない）
}, {
  enableHighAccuracy: true                        // 高精度で測定するオプション
});