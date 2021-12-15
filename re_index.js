/*-------------------------------------------
*変数定義パート
*bus_stop_num : バス停の数
*bus_stop_names : 各バス停の名前
*bus_stop_positions : バス停の位置情報を格納
*timetable : バスの時刻表(仮)
*stops : バス停インスタンス <-- render部分で毎回新たに生み出すのが無駄であるため
*ctx : Canvasの描画部
-------------------------------------------*/
const bus_stop_num = 6;

const bus_stop_names = ["つくばセンター","吾妻小学校前","春日キャンパス","筑波メディカル前","第一エリア前","筑波大学中央"]

const bus_stop_positions = [[100,100],[200,100],[300,100],[400,100],[500,100],[600,100]];

const timetable = [
  [2300, 3300, 3500, 4400, 4600, 10400],
  [10300, 10500, 10520, 10540, 10600, 10620],
  [11100, 11100, 11100, 11100, 11100, 12200],
  [84000, 84100, 84200, 90700, 90800, 91500],
  [85500, 85900, 90200, 91700, 91800, 92500],
  [105000, 105100, 105200, 111700, 111800, 112500],
];

let stops = [];
for(i=0; i<bus_stop_num; i++){
    const stop = new Stop(i);
    stops.push(stop);
}

var cvs = document.createElement("canvas");
cvs.style.backgroundColor = "rgba(2,2,2,0.2)";
cvs.width = 700;
cvs.height = 200;
document.getElementById("container").appendChild(cvs);
var ctx = cvs.getContext("2d");
