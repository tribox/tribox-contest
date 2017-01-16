<?php

/**
 * 入賞ポイント進呈通知メールを送る
 *
 * Usage:
 *   php send-winners.php foo@tribox.jp "名前" "シーズン名" "(競技名_順位_ポイント)ハイフン区切り" ポイント数
 */

var_dump($argv);
if (count($argv) != 6) {
    exit("Invalid arguments\n");
}

mb_language('ja');
mb_internal_encoding('UTF-8');

$to_email = $argv[1];
$to_name = $argv[2];
$season = $argv[3];
$events_name = $argv[4];
$point = $argv[5];

$seasonstr = substr($season, 0, 4) . '年';
if (substr($season, 4, 1) === '1') {
    $seasonstr .= '前半期';
} else if (substr($season, 4, 1) === '2') {
    $seasonstr .= '後半期';
}

$winnerslist = str_replace('-', "\n", $events_name);
$winnerslist = str_replace('_', ' ', $winnerslist);

$header = 'From:' . mb_encode_mimeheader('tribox Contest') . '<support@tribox.jp>' . "\n"
                  . 'Cc: support@tribox.jp' . "\n"
                  . 'Reply-to: support@tribox.jp';
$subject = '[tribox Contest] 入賞賞金 (triboxポイント) 進呈のお知らせ';
$body = $to_name . " 様\n\n"
      . "トライボックスコンテストにご参加頂き、誠にありがとうございます。\n"
      . $seasonstr . "のシーズンランキング入賞者のみなさまに、入賞賞金 (triboxポイント) についてお知らせ致します。\n\n"
      . $winnerslist . "\n"
      . "合計付与ポイント: " . $point . "\n\n"
      . "https://contest.tribox.com/ranking/" . $season . "\n\n"
      . "おめでとうございます！\n"
      . "triboxポイントは、みなさまのtriboxストアアカウントに既に付与されています。\n"
      . "最新のパズル購入などにご利用ください。\n\n"
      . "今シーズンもぜひよろしくお願い致します。\n"
      . "https://contest.tribox.com/\n"
      . "株式会社トライボックス\n";
$res = mb_send_mail($to_email, $subject, $body, $header);
