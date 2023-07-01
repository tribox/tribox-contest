<?php

/**
 * ポイント加算通知メールを送る
 *
 * Usage:
 *   php send-pointemail.php foo@tribox.jp "名前" "コンテスト名" "種目名" ポイント数 ポイントタイプ(0/1)
 */

if (count($argv) != 7) {
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

// Prepare email contents
$to_email = $argv[1];
$to_name = $argv[2];
$contest_name = $argv[3];
$event_name = $argv[4];
$point = $argv[5];
$point_type = $argv[6];

$text = "おめでとうございます！\nTORIBOコンテストの抽選にて当選されましたので、\nお客様のTORIBOストアアカウントにポイントを進呈致しました。\n\n";
if ($point_type == 1) {
    $text = "参加ありがとうございます。\n契約アカウントの皆様に、ポイント進呈のお知らせです。\n\n";
}

$subject = '[TORIBO Contest] ポイント進呈のお知らせ';
$body = $to_name . " 様\n\n"
      . $text
      . "コンテスト名: " . $contest_name . "\n"
      . "種目名: " . $event_name . "\n"
      . "進呈ポイント: " . $point . "\n\n"
      . "TORIBOストアのマイページよりご確認ください。\n"
      . "https://store.tribox.com/mypage/\n\n"
      . "TORIBOコンテスト\n"
      . "https://contest.tribox.com\n";

// Send an email using PHPMailer
$mailer = new PHPMailer(true);

$mailer->CharSet = 'UTF-8';
$mailer->SMTPDebug = 0;
$mailer->isSMTP();
$mailer->Host = 'localhost';
$mailer->Port = 25;

$mailer->setFrom('support@tribox.jp', mb_encode_mimeheader('TORIBO Contest'));
$mailer->addAddress($to_email);
$mailer->addReplyTo('support@tribox.jp');
$mailer->addCC('support@tribox.jp');

$mailer->isHTML(false);
$mailer->Subject = mb_encode_mimeheader($subject);

$mailer->Body = $body;

if (!$mailer->send()) {
    echo 'Mailer Error: ' . $mail->ErrorInfo;
} else {
    echo 'Message sent!';
}
