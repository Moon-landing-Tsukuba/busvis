<?php

define('DSN', 'mysql:host=kutnpvrhom7lki7u.cbetxkdyhwsb.us-east-1.rds.amazonaws.com:3306;dbname=lcgyul56yfcheas3;charset=utf8mb4');
define('DB_USER', 'qniv4bnn438d3vf3');
define('DB_PASS', 'tpcjvhz7crsilp40');

try {
  $pdo = new PDO(
    DSN,
    DB_USER,
    DB_PASS,
    [
      PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
      PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_OBJ,
      PDO::ATTR_EMULATE_PREPARES => false,
    ]
  );
} catch (PDOException $e) {
  echo $e->getMessage();
  exit;
}

if($_SERVER['REQUEST_METHOD'] === 'POST'){
  //ここに日付が変わったらときのUPDATE処理を書く

  if(isset($_POST['id']) && isset($_POST['direction'])){
    $user_station =$_POST['id'];
    $direction = $_POST['direction'];

    $sql = "SELECT id, ".$direction." FROM latetimes WHERE id = ".$user_station." AND DATE_FORMAT(updated_at, '%Y-%m-%d') = DATE_FORMAT(CURTIME(), '%Y-%m-%d')";
    $stmt = $pdo->query($sql);
    $result = $stmt->fetch();  //PDO::FETCH_ASSOCを指定すれば配列形式で返ってくる。ex) $result['id']のように指定。
    echo($result->$direction);
    exit;
  }
  if(isset($_POST['fetchid']) && isset($_POST['direct']) && isset($_POST['latetime'])){
    $fetchid = $_POST['fetchid'];
    $direct = $_POST['direct'];
    $receive_time = $_POST['latetime'];

    $stmt = $pdo->query("UPDATE latetimes SET $direct = $receive_time WHERE id = $fetchid");
    $stmt->execute();
  }
}

function getLate($pdo)
{
  $stmt = $pdo->query("SELECT * FROM latetimes ");
  $lates = $stmt->fetchAll();
  return $lates;
}

$lates = getLate($pdo);

?>


<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>BusVis</title>
        <link rel="stylesheet" href="style.css">
        <meta http-equiv="Pragma" content="no-cache">
        <meta http-equiv="Cache-Control" content="no-cache">
        <meta http-equiv="Expires" content="0">
    </head>
    <body>
        <header class="page-header wrapper" id='header-id'>
            <div class="inner-box">
                <div class="font-biggest">
                    <p id="user-station">つくばセンター</p>
                </div>
                <div class="font-departure">
                    <p id="departure-time">　</p>
                </div>
                <div class="flex-container">
                    <div id="remaining-time-box">
                        <div class="font-smaller">
                            <p>次の発車まであと</p>
                        </div> 
                        <div class="font-bigger">
                            <p id="remaining-time">　</p>
                        </div>
                    </div>
                    <div id="expected-time-box">
                        <div class="font-delay">
                            <p id="late-time-line"><span id="late-time">　</span><span id="late-word"></span></p>
                        </div>
                        <div class="font-smaller">
                            <p id="expected-time">　</p>
                        </div>
                    </div>
                </div>
            </div> 
        </header>
        
        <div class="user-reaction-box" id="user-reaction">
            <div id="reaction-items">
                <ul>
                    <li class="reaction-item" data-late="0">遅れなし</li>
                    <li class="reaction-item" data-late="2">2分遅れ</li>
                    <li class="reaction-item" data-late="4">4分遅れ</li>
                </ul>
            </div>
        </div>

        <div id="container" class="canvas-box">
            <canvas id="bus-map"></canvas>
        </div>

        <div class="btn-box wrapper">
            <div class="btn-container">
                <div class="btn btn-common switch-left-right on"></div>
                <!-- <div class="btn btn2 change-bus-stop"></div> バス停を変更するボタン -->
                <div class="btn btn2 change-bus"></div> <!--バスを変更するボタン-->
                <div class="btn btn-common switch-holiday-weekday weekday"></div>
            </div>
        </div>
        <div class="explanation-wrapp" id="explanation">
            <div class="explanation">
                <div class="box7">
                    <div class="logo-pos">
                        <img src="img/logo--.png" class="logo-size">
                    </div>
                    <p>BusVisは、筑波大学循環バスの遅延情報を確認できるアプリです。</br>
                        現在地から最寄りのバス停が自動で選択されていますが、乗りたいバス停を選択してみてください。</br>
                        右回り・左回りを変更したり、平日・休日を変更できます。</br>
                        現在時刻に沿ったバスが表示されていて、選択されているバス停までの到着時刻を表示しています。</br>
                        「バス」ボタンを押すことで、別のバスを選択できます。</br>
                        遅延情報を送信するボタンがユーザーから押されることで、バスの遅延状況を全ユーザーに反映します。</br></p>
                </div>
            </div>
        </div>
        <div class="time-tables">
            <div>
                <h2 class="time-title">つくばセンター発の時刻表</h2>
            </div>
            <div class="table-flex-container">
                <div class="table-wrapp" id="normal-right">
                    <p>平日 右回り</p>
                    <table>
                        <tr>
                            <td class="row-head">6</td>
                            <td class="table-date">00 40</td>
                            <td class="row-head">15</td>
                            <td class="table-date">00 20 40</td>
                        </tr>
                        <tr>
                            <td class="row-head">7</td>
                            <td class="table-date">20 50</td>
                            <td class="row-head">16</td>
                            <td class="table-date">00 20 40</td>
                        </tr>
                        <tr>
                            <td class="row-head">8</td>
                            <td class="table-date">00 10 30 40 50</td>
                            <td class="row-head">17</td>
                            <td class="table-date">00 20 40</td>
                        </tr>
                        <tr>
                            <td class="row-head">9</td>
                            <td class="table-date">10 20 30 50</td>
                            <td class="row-head">18</td>
                            <td class="table-date">00 20 40</td>
                        </tr>
                        <tr>
                            <td class="row-head">10</td>
                            <td class="table-date">00 20 40</td>
                            <td class="row-head">19</td>
                            <td class="table-date">00 20 40</td>
                        </tr>
                        <tr>
                            <td class="row-head">11</td>
                            <td class="table-date">00 20 40</td>
                            <td class="row-head">20</td>
                            <td class="table-date">00 20 40</td>
                        </tr>
                        <tr>
                            <td class="row-head">12</td>
                            <td class="table-date">00 20 40</td>
                            <td class="row-head">21</td>
                            <td class="table-date">00 40</td>
                        </tr>
                        <tr>
                            <td class="row-head">13</td>
                            <td class="table-date">00 20 40</td>
                            <td class="row-head">22</td>
                            <td class="table-date">20</td>
                        </tr>
                        <tr>
                            <td class="row-head">14</td>
                            <td class="table-date">00 20 40</td>
                            <td class="table-date"> </td>
                            <td class="table-date"> </td>
                        </tr>
                    </table>
                </div>
                </br>
                <div class="table-wrapp" id="normal-left">
                    <p>平日 左回り</p>
                    <table>
                        <tr>
                            <td class="row-head">6</td>
                            <td class="table-date">20</td>
                            <td class="row-head">15</td>
                            <td class="table-date">10 30 50</td>
                        </tr>
                        <tr>
                            <td class="row-head">7</td>
                            <td class="table-date">00 40</td>
                            <td class="row-head">16</td>
                            <td class="table-date">10 30 50</td>
                        </tr>
                        <tr>
                            <td class="row-head">8</td>
                            <td class="table-date">20</td>
                            <td class="row-head">17</td>
                            <td class="table-date">10 30 50</td>
                        </tr>
                        <tr>
                            <td class="row-head">9</td>
                            <td class="table-date">00 40</td>
                            <td class="row-head">18</td>
                            <td class="table-date">10 30 50</td>
                        </tr>
                        <tr>
                            <td class="row-head">10</td>
                            <td class="table-date">10 30 50</td>
                            <td class="row-head">19</td>
                            <td class="table-date">10 30 50</td>
                        </tr>
                        <tr>
                            <td class="row-head">11</td>
                            <td class="table-date">10 30 50</td>
                            <td class="row-head">20</td>
                            <td class="table-date">10 30 50</td>
                        </tr>
                        <tr>
                            <td class="row-head">12</td>
                            <td class="table-date">10 30 50</td>
                            <td class="row-head">21</td>
                            <td class="table-date">20</td>
                        </tr>
                        <tr>
                            <td class="row-head">13</td>
                            <td class="table-date">10 30 50</td>
                            <td class="row-head">22</td>
                            <td class="table-date">00</td>
                        </tr>
                        <tr>
                            <td class="row-head">14</td>
                            <td class="table-date">10 30 50</td>
                            <td class="table-date"> </td>
                            <td class="table-date"> </td>
                        </tr>
                    </table>
                </div>
            </div>
            </br>
            <div class="table-flex-container">
                <div class="table-wrapp" id="normal-right">
                    <p>休日 右回り</p>
                    <table>
                        <tr>
                            <td class="row-head">6</td>
                            <td class="table-date">00 40</td>
                            <td class="row-head">15</td>
                            <td class="table-date">20</td>
                        </tr>
                        <tr>
                            <td class="row-head">7</td>
                            <td class="table-date">20</td>
                            <td class="row-head">16</td>
                            <td class="table-date">00 40</td>
                        </tr>
                        <tr>
                            <td class="row-head">8</td>
                            <td class="table-date">00 40</td>
                            <td class="row-head">17</td>
                            <td class="table-date">20</td>
                        </tr>
                        <tr>
                            <td class="row-head">9</td>
                            <td class="table-date">20</td>
                            <td class="row-head">18</td>
                            <td class="table-date">00 40</td>
                        </tr>
                        <tr>
                            <td class="row-head">10</td>
                            <td class="table-date">00 40</td>
                            <td class="row-head">19</td>
                            <td class="table-date">20</td>
                        </tr>
                        <tr>
                            <td class="row-head">11</td>
                            <td class="table-date">20</td>
                            <td class="row-head">20</td>
                            <td class="table-date">00 40</td>
                        </tr>
                        <tr>
                            <td class="row-head">12</td>
                            <td class="table-date">00 40</td>
                            <td class="row-head">21</td>
                            <td class="table-date">20</td>
                        </tr>
                        <tr>
                            <td class="row-head">13</td>
                            <td class="table-date">20</td>
                            <td class="row-head">22</td>
                            <td class="table-date">00</td>
                        </tr>
                        <tr>
                            <td class="row-head">14</td>
                            <td class="table-date">00 40</td>
                            <td class="table-date"> </td>
                            <td class="table-date"> </td>
                        </tr>
                    </table>
                </div>
                </br>
                <div class="table-wrapp" id="normal-left">
                    <p>休日 左回り</p>
                    <table>
                        <tr>
                            <td class="row-head">6</td>
                            <td class="table-date">20</td>
                            <td class="row-head">15</td>
                            <td class="table-date">00 40</td>
                        </tr>
                        <tr>
                            <td class="row-head">7</td>
                            <td class="table-date">00 40</td>
                            <td class="row-head">16</td>
                            <td class="table-date">20</td>
                        </tr>
                        <tr>
                            <td class="row-head">8</td>
                            <td class="table-date">20</td>
                            <td class="row-head">17</td>
                            <td class="table-date">00 40</td>
                        </tr>
                        <tr>
                            <td class="row-head">9</td>
                            <td class="table-date">00 40</td>
                            <td class="row-head">18</td>
                            <td class="table-date">20</td>
                        </tr>
                        <tr>
                            <td class="row-head">10</td>
                            <td class="table-date">20</td>
                            <td class="row-head">19</td>
                            <td class="table-date">00 40</td>
                        </tr>
                        <tr>
                            <td class="row-head">11</td>
                            <td class="table-date">00 40</td>
                            <td class="row-head">20</td>
                            <td class="table-date">20</td>
                        </tr>
                        <tr>
                            <td class="row-head">12</td>
                            <td class="table-date">20</td>
                            <td class="row-head">21</td>
                            <td class="table-date">00 40</td>
                        </tr>
                        <tr>
                            <td class="row-head">13</td>
                            <td class="table-date">00 40</td>
                            <td class="row-head">22</td>
                            <td class="table-date">20</td>
                        </tr>
                        <tr>
                            <td class="row-head">14</td>
                            <td class="table-date">20</td>
                            <td class="table-date"> </td>
                            <td class="table-date"> </td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>
        <div>
            <div class="logo-wrapp">
                <img src="img/big_logo.png" class="big_logo_size">
            </div>
        </div>
        <div id="now" display="none"></div>
        <script src="./timetable_list.js"></script>
        <script src="./index.js"></script>
        <script src="./cache.js?p=(new Date()).getTime()"></script>
    </body>
</html>
