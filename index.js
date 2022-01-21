/*-------------------------------------------
*管理クラスAdministrator
-------------------------------------------*/

const administrator = {
  direction: true, //右回りならTrue
  user_station: 0, //バス停の識別IDが入る
  previous_station : 0, //headerが出ているときに選択されているバスのID
  target_table: [],
  buses: [],
  holiday: false, //休日ならばtrue
  correct_holiday : false,
  bus_stop_select_mode : false, //バス停選択時true
  bus_select_mode : false, //バス選択時true
  selected_bus_id : 100, //選択されているバスのID
  previous_bus : 0, //headerが出ているときに選択されているバスのID
  next_bus : null, //待機中のバスインスタンス
  next_timetable : [], //next_busが参照しているタイムテーブル
  remaining_time : 0,
  remaining_min : 0,
  remaining_sec : 0,
  switch : false,
  departure_time : 600000, //選択されているバス停を選択されているバスが出発する時刻
  late_time : 2, //遅延時間
  remaining_min : 0,
  remaining_sec : 0,
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
  // console.log(administrator);
  ajax_func();
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
  // console.log(administrator);
})

const reactions = document.querySelectorAll(".reaction-item");
reactions.forEach(reaction => {
  reaction.addEventListener("click", () => {
    let late = reaction.dataset.late;
    let id = administrator.selected_bus_id + 1;
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
  // console.log(administrator);
})

document.querySelector(".change-bus").addEventListener("click", (event) => {
  event.target.classList.toggle("on-bus")
  // console.log(JSON.parse(JSON.stringify(administrator)));
  if (event.target.classList.contains("on-bus")) {
    administrator.bus_select_mode = true;// alert("bus_select_mode = true");
    // console.log("bus_select_mode = true");
  } else {
    administrator.bus_select_mode = false;// alert("bus_select_mode = false");
    // console.log("bus_select_mode = false");
  }
  // console.log(JSON.parse(JSON.stringify(administrator)));
})

/*-------------------------------------------
* HEADER更新パート
-------------------------------------------*/
let user_station_dom = document.getElementById('user-station');
let departure_time_dom = document.getElementById('departure-time');
let remaining_time_dom = document.getElementById('remaining-time');
let late_time_dom = document.getElementById('late-time');
let late_word_dom = document.getElementById('late-word');
let expected_time_dom = document.getElementById('expected-time');
let header_dom = document.getElementById('header-id');


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

const bus_stop_names = ["つくばセンター\n","吾妻小学校前","筑波大学\n春日キャンパス","筑波メディカル\nセンター前","筑波大学病院\n入口","追越学生宿舎前","平砂学生宿舎前","筑波大学西","大学会館前","第一エリア前","第三エリア前","陸域環境\n研究センター前","農林技術\nセンター前","一の矢\n学生宿舎前","大学植物見本園","TARA\nセンター前","筑波大学中央","大学公園","松美池","天久保三丁目","合宿所","天久保池","天久保二丁目","追越宿舎東","筑波メディカル\nセンター病院","筑波メディカル\nセンター前","筑波大学\n春日キャンパス","吾妻小学校前","つくばセンター"]
const bus_stop_latlng = [[36.082537, 140.112707],[36.085158, 140.109299],[36.087872, 140.107274],[36.090369, 140.105539],[36.093142, 140.103876],[36.095351, 140.102961],[36.097729, 140.102154],[36.103252, 140.101509],[36.104838, 140.101194],[36.107915, 140.099888],[36.110122, 140.098603],[36.114711, 140.096923],[36.118348, 140.096042],[36.119404, 140.099170],[36.116047, 140.102103],[36.113164, 140.102179],[36.111278, 140.103595],[36.109826, 140.104035],[36.108121, 140.104282],[36.106372, 140.105679],[36.103688, 140.106732],[36.100184, 140.105618],[36.097574, 140.106049],[36.094516, 140.106743],[36.092658, 140.106397]]

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

var container = document.getElementById("user-reaction");
var cvs = document.getElementById("bus-map");
var view_size = is_smart_phone() ? get_screen_size() : get_page_size();
var top_infos_margin = container.clientHeight;
const bottom_buttons_margin = 50;
var w = view_size[0] < 500 ? view_size[0] : 500;
// var h = view_size[1] - top_infos_margin - bottom_buttons_margin;
var h = 500;
cvs.width = w;
cvs.height = h;
// console.log(view_size);
var ctx = cvs.getContext("2d");

var bus_stop_positions = make_position(); //canvas上の位置

let stops = [];
for (i = 0; i < bus_stop_num; i++) {
  const stop = new Stop(i);
  stops.push(stop);
}

// console.log(cvs.clientWidth);


let header_height = header_dom.clientHeight;
container.style.paddingTop = header_height + 'px';

container.style.visibility = "hidden";


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
  this.size = w / 30;
  this.is_clicked = false;

  this.draw = function (ctx, x, y) {
    // size = バスのサイズ
    me.size = w / 30;

    // size = sizeのパラメータ
    let size2 = me.size*0.45;

    // 線の幅は適当に割った
    ctx.lineWidth = w / 100;
    ctx.strokeStyle = "white";

    // 色 = '#ff4e72' <- アイコンのピンク色
    // 一番大きい円の描画
    // ctx.fillStyle = "#ff4e72";
    if(administrator.selected_bus_id === me.id){
      ctx.fillStyle = "#FF5F76";
    }else{
      ctx.fillStyle = "#32A9C2";
    }
    ctx.beginPath();
    ctx.moveTo(x+me.size, y);
    ctx.arc(x, y, me.size, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();

    // 白い長方形の描画
    ctx.fillStyle = "white";
    ctx.fillRect(x-size2*1.1, y-size2*1.3, size2*2.2, size2*2.2);
    ctx.fillRect(x-size2*0.9, y+size2*0.88, size2*0.4, size2*0.4);
    ctx.fillRect(x+size2*0.5, y+size2*0.88, size2*0.4, size2*0.4);

    // ピンク色の長方形の描画
    // ctx.fillStyle = "#ff4e72";
    if(administrator.selected_bus_id === me.id){
      ctx.fillStyle = "#FF5F76";
    }else{
      ctx.fillStyle = "#32A9C2";
    }
    ctx.fillRect(x-size2*0.95, y-size2*1.15, size2*1.9, size2*0.4);
    ctx.fillRect(x-size2*0.95, y-size2*0.6, size2*1.9, size2*0.7);
    ctx.fillRect(x-size2*0.95, y+size2*0.3, size2*0.4, size2*0.25);
    ctx.fillRect(x+size2*0.55, y+size2*0.3, size2*0.4, size2*0.25);
  };

  window.addEventListener("mousedown", function (e) {
    var dx = me.position_x - e.layerX;
    var dy = me.position_y - e.layerY;
    me.is_clicked = Math.sqrt(dx * dx + dy * dy) < me.size;
    administrator.buses.forEach(function(value, index) {
      // console.log(JSON.parse(JSON.stringify(value)));
      if (value.id === me.id || me.id === 100) {
        if (administrator.bus_select_mode){  //バス変更ボタンが押されている＆どこかのバスがクリックされたら切り替え
          if (me.is_clicked) {
            // console.log("bus clicked and my bus ID is " + me.id);
            administrator.selected_bus_id = me.id;
            // console.log("selected_bus_id : " +administrator.selected_bus_id);
            administrator.bus_select_mode = false;
            document.querySelector(".change-bus").classList.remove("on-bus");
            ajax_func();
          }
        }
      }
    })
  });
}

function Stop(id) {
  var me = this;
  var [x, y] = bus_stop_positions[id];
  this.id = id;
  this.size = w / 30;
  this.remaining_time = 0;
  this.is_clicked = false;
  this.name = bus_stop_names[id];
  this.change_color = "#32A9C2"; //バス停変更ボタンが押された場合の色
  this.selected_color = "#FF5F76"; //ユーザーが選択しているバス停の色
  this.default_color = "#fff"; //デフォルトのバス停の色
  this.stroke_color = "#32A9C2"; //バス停のstrokeStyleの色

  this.draw = function (ctx) {
    [x, y] = bus_stop_positions[id];
    me.size = w / 30;
    ctx.lineWidth = w / 150;
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

    if(1){ // administrator.bus_stop_select_mode
      ctx.fillStyle = "#666";
      const width = ctx.measureText(me.name).width;
      const font_size = w/45;
      const rotate_size = 75; // 半時計回り
      // console.log(font_size);
      // ctx.font = "italic bold " + font_size + "pt sans-serif";
      ctx.font = "" + font_size + "pt 'Arial'";
      // console.log(me.name.indexOf("\n") !== -1);
      if (me.name.indexOf("\n") !== -1) { // 改行を含む時
        const index = me.name.indexOf("\n");
        const t1 = me.name.slice(0, index);
        const t2 = me.name.slice(index+1);
        const w1 = ctx.measureText(t1).width;
        const w2 = ctx.measureText(t2).width;
        if (id < 11) {
          ctx.fillText(t1, x-w1, y);
          ctx.textBaseline = "top";
          ctx.fillText(t2, x-w2, y);
          ctx.textBaseline = "bottom";
        } else if (id < 14) {
          ctx.translate(x, y);
          ctx.rotate(-rotate_size / 180 * Math.PI);
          ctx.fillText(t1, 0-w1, 0);
          ctx.textBaseline = "top";
          ctx.fillText(t2, 0-w2, 0);
          ctx.textBaseline = "bottom";
          ctx.rotate(rotate_size / 180 * Math.PI);
          ctx.translate(-x, -y);
        } else if (id < 25) {
          ctx.fillText(t1, x, y);
          ctx.textBaseline = "top";
          ctx.fillText(t2, x, y);
          ctx.textBaseline = "bottom";
        } else {
          ctx.translate(x, y);
          ctx.rotate(-rotate_size / 180 * Math.PI);
          ctx.fillText(t1, 0, 0);
          ctx.textBaseline = "top";
          ctx.fillText(t2, 0, 0);
          ctx.textBaseline = "bottom";
          ctx.rotate(rotate_size / 180 * Math.PI);
          ctx.translate(-x, -y);
        }
      } else {
        if (id < 11) {
          ctx.fillText(me.name, x-width, y);
        } else if (id < 14) {
          ctx.translate(x, y);
          ctx.rotate(-rotate_size / 180 * Math.PI);
          ctx.fillText(me.name, 0-width, 0);
          ctx.rotate(rotate_size / 180 * Math.PI);
          ctx.translate(-x, -y);
        } else if (id < 25) {
          ctx.fillText(me.name, x, y);
        } else {
          ctx.translate(x, y);
          ctx.rotate(-rotate_size / 180 * Math.PI);
          ctx.fillText(me.name, 0, 0);
          ctx.rotate(rotate_size / 180 * Math.PI);
          ctx.translate(-x, -y);
        }
      }
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
*calc_nearest_stop : 現在地から一番近いバス停を計算する。
*decide_timetable : adiministratorのholidayとdirectionの値からtimetableを決定する。
*check_holiday : 祝日または休日ならadministratorのholidayをtrueとする関数。
*get_screen_size : 画面サイズを取得。
*get_page_size : ページサイズ（htmlが表示されている部分のサイズ）を取得。
*is_smart_phone : スマートフォンかどうか調べる関数。
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
  if(table.length === 0 && (now < timetable[0][0] || timetable[timetable.length - 1][27] < now)){ 
    next_table = timetable[0];
    // console.log("There is no bus");
  }

  administrator.target_table = table;
  administrator.next_timetable = next_table;
}
//👆運行中のバスと待機中のバスの時刻表を算出。

//👇バスのインスタンス＋IDを生成。
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
  var stopps;

  if (admin.direction) {  
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
    const x = start_stop[0] + (end_stop[0] - start_stop[0]) * propotion;
    const y = start_stop[1] + (end_stop[1] - start_stop[1]) * propotion;
    bus.position_x = x;
    bus.position_y = y;
  });
}

function calc_nearest_stop(lat, lng) {
  var min_dist;
  var min_dist_index;
  for (var i=0; i<bus_stop_num-3; i++) {
    var dx = lat - bus_stop_latlng[i][0];
    var dy = lng - bus_stop_latlng[i][1];
    var dist = Math.sqrt(dx*dx + dy*dy);
    if (i === 0) {
      min_dist = dist
      min_dist_index = 0;
    } else if (min_dist > dist) {
      min_dist = dist
      min_dist_index = i;
    }
  }
  // console.log(min_dist_index);
  return min_dist_index;
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

function get_screen_size() {
  const screen_size = []
	screen_size.push(window.parent.screen.width);
  screen_size.push(window.parent.screen.height);
  return screen_size;
}

function get_page_size() {
  const page_size = []
	page_size.push(document.documentElement.clientWidth);
  page_size.push(document.documentElement.clientHeight);
  return page_size;
}

function is_smart_phone() {
  if (navigator.userAgent.match(/iPhone|Android.+Mobile/)) {
    return true;
  } else {
    return false;
  }
}

function selected_bus_id_initialized(){
  const now = load_now();
  let userStation = administrator.user_station;
  const buses = administrator.buses;
  let candidate_time = [];
  let count = 0;

  if(buses.length === 0){ //バスがなければ待機中のバスがselectされる
    administrator.selected_bus_id = 100;
  }else{
    buses.some(function(value, index){
      if(!administrator.direction){ //左回りの場合timetableの参照位置に気を付ける
        userStation = timetable[0].length - userStation - 1;
      }
      candidate_time.push(value.timetable[userStation]);
    });

    // console.log(candidate_time);

    candidate_time.some(function(value, index){
      if(now > value) count = count + 1;
    });
    
    if(count === administrator.buses.length){
      administrator.selected_bus_id = 100;
    }else{
      administrator.selected_bus_id = administrator.buses[count].id;
    }
  }
  // console.log("count : " + count);
  // console.log("selectedID : " + administrator.selected_bus_id);
}

function calc_remaining_time(adm){
  const now = load_now();
  let userStation = adm.user_station;
  let bus_id = adm.selected_bus_id;
  let arrivalTime;

  if(!adm.direction){ //左回りの場合の値
    if(userStation == 28){
      userStation = 0;
    }else{
      userStation = timetable[0].length - userStation - 1; 
    }
  }

  if(bus_id == 100){
    arrivalTime = administrator.next_timetable[userStation];
  }else{
    // console.log(timetable);
    arrivalTime = timetable[bus_id][userStation];
  }

  const now_hour = Math.floor(now/10000);
  const now_min = Math.floor(now/100) - now_hour*100;
  const now_sec = now - now_hour*10000 - now_min*100;
  const tgt_hour = Math.floor(arrivalTime/10000);
  const tgt_min = Math.floor(arrivalTime/100) - tgt_hour*100;
  const tgt_sec = arrivalTime - tgt_hour*10000 - tgt_min*100;

  administrator.departure_time = tgt_hour + "時" + tgt_min + "分";

  const now_time = now_hour*3600 + now_min*60 + now_sec; //現在時刻を秒で表現
  const tgt_time = tgt_hour*3600 + tgt_min*60 + tgt_sec; //到着時刻を秒で表現
  
  let arrival = tgt_time - now_time;

  if(arrival >= 0){
    const arrival_min = Math.floor(arrival/60);
    const arrival_sec = arrival - arrival_min*60;
    administrator.remaining_time = arrival_min + "分" + arrival_sec + "秒";
    administrator.remaining_min = arrival_min;
    administrator.remaining_sec = arrival_sec;
  }else{
    arrival = arrival * (-1);
    const arrival_min = Math.floor(arrival/60);
    const arrival_sec = arrival - arrival_min*60;
    administrator.remaining_time = "-" + arrival_min + "分" + arrival_sec + "秒";
    administrator.remaining_min = arrival_min;
    administrator.remaining_sec = arrival_sec;
  }
}

function ajax_func(){
  // -----------Ajaxを記述. バスの遅延時間を取得.---------
  let id = administrator.selected_bus_id + 1;
  let direction;
  if (administrator.direction) {
    direction = 'rights';
  } else {
    direction = 'lefts';
  }

  var req = new XMLHttpRequest();
  req.open('POST', 'index.php', true);
  req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  req.send("id=" + id + "&direction=" + direction);
  req.onreadystatechange = function () {
    var result = document.getElementById('result');
    if (req.readyState == 4) { // 通信の完了時
      if (req.status == 200) { // 通信の成功時
        late_time_dom.innerHTML = req.responseText;
        administrator.late_time = req.responseText;
      }
    } else {
      result.innerHTML = "通信中...";
    }
  } //-----
}
function manage_header(adm){
  if(adm.remaining_min == 0 && adm.remaining_sec < 20){
    container.style.visibility ="visible";
    container.style.height = null ;
    adm.previous_station = adm.user_station;
    adm.previous_bus = adm.selected_bus_id;
    let canvas_box = document.getElementById('container');
    let reaction_items_dom = document.getElementById('reaction-items');
    let reaction_items_height = reaction_items_dom.clientHeight;
    canvas_box.style.paddingTop = reaction_items_height + "px";

  }
  else{  
    if(adm.previous_station != adm.user_station || adm.previous_bus != adm.selected_bus_id )
    {
      container.style.visibility ="hidden";
      container.style.height = "0";
      let canvas_box = document.getElementById('container');
      canvas_box.style.paddingTop = "13px";
    }
  }
}

function render() {
  let header_height = header_dom.clientHeight;
  container.style.paddingTop = header_height + 'px';
  // console.log(administrator);
  ctx.clearRect(0, 0, w, h);

  //map
  if(!administrator.bus_stop_select_mode){
    const left_bottom_pos = bus_stop_positions[0];
    const left_top_pos = bus_stop_positions[10];
    const right_bottom_pos = bus_stop_positions[14];
    const right_top_pos = bus_stop_positions[24];
    ctx.lineWidth = w / 40;
    // ctx.lineWidth = w / 50; //commit#38492300にあった方
    ctx.strokeStyle = "#32A9C2";
    ctx.beginPath();
    ctx.moveTo(left_bottom_pos[0], left_bottom_pos[1]);
    ctx.lineTo(left_top_pos[0], left_top_pos[1]);
    //ctx.arc(中心座標x, 中心座標y, 半径, 開始角, 終了角, 反時計回りか？); 3時〜12時の位置 ctx.arc(320, 120, 80, 0, 1.5 * Math.PI);
    //開始角は3時の方角で時計回り
    // ctx.arc(w/2-h/5+r, h/5, r, Math.PI, 3*Math.PI/2, false);
    ctx.lineTo(right_bottom_pos[0], right_bottom_pos[1]);
    ctx.lineTo(right_top_pos[0], right_top_pos[1]);
    ctx.closePath();
    ctx.stroke();
  }

  //待機中のバスを描画
  const left_bottom_pos = bus_stop_positions[0];
  const tmp_x = left_bottom_pos[0] - w/10;
  const tmp_y = left_bottom_pos[1];
  administrator.next_bus.position_x = tmp_x;
  administrator.next_bus.position_y = tmp_y;
  administrator.next_bus.draw(ctx, tmp_x, tmp_y); 

  //停留所インスタンスの生成
  for (var i = 0; i < bus_stop_num; i++) {
    stops[i].draw(ctx);
  }
  //待機中のバスが発車した際にそのバスを選択し続ける。
  var last_bus_id;
  if(administrator.buses.length > 0){
    last_bus_id = administrator.buses[administrator.buses.length-1].id;
  }else{
    last_bus_id = -1;
  }
  // console.log(last_bus_id);
  check_table();
  create_buses(administrator.target_table);
  calc_bus_param(administrator.buses);
  calc_pos(administrator);
  if(administrator.buses.length > 0){
    var next_bus_id = administrator.buses[administrator.buses.length-1].id;
    // ajax_func();
    if((last_bus_id == -1 || last_bus_id != -1 && last_bus_id != next_bus_id) && administrator.selected_bus_id == 100){
      administrator.selected_bus_id = next_bus_id;
    }
  } 
  //バスや・バス停が変更された際はselected_bus_idを計算しなおす
  if(administrator.switch){
    // console.log("1 - selected_bus_id : " +administrator.selected_bus_id);
    selected_bus_id_initialized();
    administrator.switch = false;
    // console.log("2 - selected_bus_id : " +administrator.selected_bus_id);

  }

  //ユーザーのいるバス停を表示
  user_station_dom.innerText = bus_stop_names[administrator.user_station];

  //出発時刻を表示
  departure_time_dom.innerText = administrator.departure_time + " 発";

  //Remaining-Timeの処理
  calc_remaining_time(administrator);
  manage_header(administrator);
  console.log(administrator);
  


  
  
  ctx.fillStyle = "black";
  ctx.font = "italic bold 5pt sans-serif";
  const rem = administrator.remaining_time
  remaining_time_dom.innerText = rem;

  //遅延を反映した予想時刻の表示
  if(administrator.correct_holiday == administrator.holiday){
    let late_min = administrator.remaining_min + administrator.late_time;
    let expected_remaining_time = late_min + "分" + administrator.remaining_sec + "秒";
    late_time_dom.innerHTML = administrator.late_time;
    expected_time_dom.innerText = expected_remaining_time;
    late_word_dom.innerHTML = "分の遅れ予想";
  }else{
    late_time_dom.innerHTML = "-"
    expected_time_dom.innerText = "---"
    late_word_dom.innerHTML = " "
  }

  //運行中のバスを描画
  administrator.buses.forEach(function (bus, index) {
    bus.draw(ctx, bus.position_x, bus.position_y);
  }); 
}

function zfill(NUM, LEN) {
  return (Array(LEN).join('0') + NUM).slice(-LEN);
}

function make_position() {
  const positions = [];
  const w_centor = w / 2;
  // const y_centor = h / 2;
  const diviser = 10;
  const map_w = w / 2;
  const map_h = h / diviser * (diviser-1);
  // console.log(map_h, top_infos_margin, bottom_buttons_margin);
  const w_left = w_centor - map_w / 2 ;
  const w_right = w_left + map_w ;
  const y_top = h / (diviser*2);
  const y_bottom = y_top + map_h;
  for (var i = 0; i < 29; i++) {
    var pos = [0, 0];
    if (i < 11) {
      pos[0] = w_left;  
      pos[1] = y_bottom - (map_h/10)*i;
    } else if (i < 14) {
      pos[0] = w_left + (map_w/4)*(i-10);
      pos[1] = y_top;
    } else if (i < 25) {
      pos[0] = w_right;
      pos[1] = y_top + (map_h/10)*(i-14);
    } else {
      pos[0] = w_right - (map_w/4)*(i-24);
      pos[1] = y_bottom;
    }
    positions.push(pos);
  }

  return positions;
}

const transpose = a => a[0].map((_, c) => a.map(r => r[c]));

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
calc_remaining_time(administrator);
ajax_func();
// console.log(administrator);

render();

setInterval(render, 50);

navigator.geolocation.watchPosition((position) => {
  var lat = position.coords.latitude;            // 緯度を取得
  var lng = position.coords.longitude;           // 経度を取得
  administrator.user_station = calc_nearest_stop(lat, lng);
  selected_bus_id_initialized();
}, (error) => {                                     // エラー処理（今回は特に何もしない）
}, {
  enableHighAccuracy: true                        // 高精度で測定するオプション
});

window.onresize = function(){
  top_infos_margin = container.clientHeight;
  view_size = is_smart_phone() ? get_screen_size() : get_page_size();
  w = view_size[0] < 500 ? view_size[0] : 500;
  // h = view_size[1] - top_infos_margin - bottom_buttons_margin;
  h = 500;
  // console.log(h, top_infos_margin, bottom_buttons_margin);
  cvs.width = w;
  cvs.height = h;
  // console.log(w, h);
  bus_stop_positions = make_position();
  render()
}