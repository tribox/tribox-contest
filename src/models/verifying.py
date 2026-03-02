"""
Verifying model for contest database
"""
from typing import List


class Verifying:
    """Verifying model class"""

    def __init__(self, id: int, user_id: str, customer_type: int, customer_id: int):
        self.id = id
        self.user_id = user_id
        self.customer_type = customer_type
        self.customer_id = customer_id

    @staticmethod
    def get_all(conn) -> List['Verifying']:
        """テーブル全体を取得"""
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, user_id, customer_type, customer_id
            FROM verifying
            ORDER BY id ASC
        """)
        results = cursor.fetchall()
        cursor.close()
        return [Verifying(**row) for row in results]

    @staticmethod
    def get_ones_by_user_id(conn, user_id: str) -> List['Verifying']:
        """コンテストユーザIDに一致する（認証済み）レコードを検索"""
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, user_id, customer_type, customer_id
            FROM verifying
            WHERE user_id = %s AND verified_at IS NOT NULL AND unverified_at IS NULL
            ORDER BY id ASC
        """, (user_id,))
        results = cursor.fetchall()
        cursor.close()
        return [Verifying(**row) for row in results]

    @staticmethod
    def get_ones_by_customer_id(conn, customer_id: int) -> List['Verifying']:
        """ストアユーザIDに一致する（認証済み）レコードを検索"""
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, user_id, customer_type, customer_id
            FROM verifying
            WHERE customer_id = %s AND verified_at IS NOT NULL AND unverified_at IS NULL
            ORDER BY id ASC
        """, (customer_id,))
        results = cursor.fetchall()
        cursor.close()
        return [Verifying(**row) for row in results]

    @staticmethod
    def get_ones_by_token(conn, token: str) -> List['Verifying']:
        """トークンに一致するレコードを検索（認証済みでも良い、ただし認証解除は含まない）"""
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT id, user_id, customer_type, customer_id
            FROM verifying
            WHERE token = %s AND unverified_at IS NULL
            ORDER BY id ASC
        """, (token,))
        results = cursor.fetchall()
        cursor.close()
        return [Verifying(**row) for row in results]

    @staticmethod
    def insert_verifying(conn, token: str, user_id: str, customer_id: int):
        """新規レコードを挿入"""
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO verifying (token, user_id, customer_type, customer_id)
            VALUES (%s, %s, 0, %s)
        """, (token, user_id, customer_id))
        conn.commit()
        cursor.close()

    @staticmethod
    def mark_verify(conn, id: int):
        """指定したレコードを認証済みとしてマークする"""
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE verifying SET verified_at = NOW() WHERE id = %s
        """, (id,))
        conn.commit()
        cursor.close()

    @staticmethod
    def mark_unverify(conn, user_id: str, customer_id: int):
        """指定したレコードを認証解除する"""
        cursor = conn.cursor()
        cursor.execute("""
            UPDATE verifying
            SET unverified_at = NOW()
            WHERE user_id = %s AND customer_id = %s
            AND verified_at IS NOT NULL AND unverified_at IS NULL
        """, (user_id, customer_id))
        conn.commit()
        cursor.close()
