<?php

/**
 * 皆勤賞ポイント (100回記念) 進呈通知メールを送る
 *
 * Usage:
 *   php send-kaikin100.php foo@tribox.jp "名前" "種目名ハイフン区切り" ポイント数
 */

if (count($argv) != 5) {
    exit("Invalid arguments\n");
}

date_default_timezone_set('Asia/Tokyo');
mb_language('ja');
mb_internal_encoding('UTF-8');

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require_once('PHPMailer/src/Exception.php');
require_once('PHPMailer/src/PHPMailer.php');
require_once('PHPMailer/src/SMTP.php');

require_once('send-email-config.php');

// Prepare email contents
$to_email = $argv[1];
$to_name = $argv[2];
$events_name = $argv[3];
$point = $argv[4];

$subject = '[' . MY_EMAIL_CONTEST_NAME . '] 通算100節記念皆勤賞ポイント進呈のお知らせ';
$body = $to_name . " 様\n\n"
      . "いつもトリボコンテストにご参加頂き、誠にありがとうございます。\n"
      . "通算100節記念皆勤賞についてのお知らせです。\n\n"
      . "皆勤賞としてTORIBOポイントを進呈させて頂きました。\n"
      . "TORIBOストアのマイページよりご確認ください。\n"
      . "https://store.tribox.com/mypage/\n\n"
      . "進呈ポイント: " . $point . "\n\n"
      . "皆勤賞の条件: 通算100節目 (2018年前半期第21節) 終了時までに3×3×3で90回以上記録を残している方\n"
      . "※非認証アカウント (TORIBOストアと連携していないアカウント) は対象外です。\n\n"
      . "今後ともぜひよろしくお願い致します。\n"
      . "https://contest.tribox.com/\n"
      . "株式会社トライボックス\n";

// Send an email using PHPMailer
$mailer = new PHPMailer(true);

$mailer->CharSet = 'UTF-8';
$mailer->SMTPDebug = 0;
$mailer->isSMTP();
$mailer->Host = MY_EMAIL_HOST;
$mailer->Port = MY_EMAIL_PORT;

$mailer->setFrom(MY_EMAIL_FROM_ADDRESS, mb_encode_mimeheader(MY_EMAIL_FROM_NAME));
$mailer->addAddress($to_email);
$mailer->addReplyTo(MY_EMAIL_FROM_ADDRESS);
$mailer->addCC(MY_EMAIL_FROM_ADDRESS);

$mailer->isHTML(false);
$mailer->Subject = mb_encode_mimeheader($subject);

$mailer->Body = $body;

if (!$mailer->send()) {
    echo 'Mailer Error: ' . $mailer->ErrorInfo . "\n";
} else {
    echo 'Message sent!' . "\n";
}
