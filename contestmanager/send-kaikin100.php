<?php

/**
 * 皆勤賞ポイント (100回記念) 進呈通知メールを送る
 *
 * Usage:
 *   php send-kaikin100.php foo@tribox.jp "名前" "種目名ハイフン区切り" ポイント数
 */

var_dump($argv);
if (count($argv) != 5) {
    exit("Invalid arguments\n");
}

mb_language('ja');
mb_internal_encoding('UTF-8');

$to_email = $argv[1];
$to_name = $argv[2];
$events_name = $argv[3];
$point = $argv[4];


$header = 'From:' . mb_encode_mimeheader('tribox Contest') . '<support@tribox.jp>' . "\n"
                  . 'Cc: support@tribox.jp' . "\n"
                  . 'Reply-to: support@tribox.jp';
$subject = '[tribox Contest] 100節記念皆勤賞ポイント進呈のお知らせ';
$body = $to_name . " 様\n\n"
      . "トライボックスコンテストにご参加頂き、誠にありがとうございます。\n"
      . "100節記念皆勤賞についてのお知らせです。\n\n"
      . "皆勤賞としてtriboxポイントを進呈させて頂きました。\n"
      . "triboxストアのマイページよりご確認ください。\n"
      . "https://store.tribox.com/mypage/\n\n"
      . "合計進呈ポイント: " . $point . "\n\n"
      . "皆勤賞の条件: 対象の種目において全ての節に何らかの記録を残している かつ DNFが3回以下\n"
      . "※非認証アカウント (triboxストアと連携していないアカウント) は対象外です。\n\n"
      . "今後ともぜひよろしくお願い致します。\n"
      . "https://contest.tribox.com/\n"
      . "株式会社トライボックス\n";
$res = mb_send_mail($to_email, $subject, $body, $header);
