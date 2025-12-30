"""
Customer model for store database
"""
from typing import List


class Customer:
    """Customer model class"""

    def __init__(self, customer_id: int, email: str):
        self.customer_id = customer_id
        self.email = email

    # @staticmethod
    # def get_all(conn) -> List['Customer']:
    #     """テーブル全体を取得"""
    #     cursor = conn.cursor(dictionary=True)
    #     cursor.execute("""
    #         SELECT customer_id, email
    #         FROM dtb_customer
    #         WHERE del_flg = 0
    #         ORDER BY customer_id ASC
    #     """)
    #     results = cursor.fetchall()
    #     cursor.close()
    #     return [Customer(**row) for row in results]

    @staticmethod
    def get_ones_by_email(conn, email: str) -> List['Customer']:
        """メールアドレスに一致するレコードを検索"""
        cursor = conn.cursor(dictionary=True)
        cursor.execute("""
            SELECT customer_id, email
            FROM dtb_customer
            WHERE email = %s AND del_flg = 0
            ORDER BY customer_id ASC
        """, (email,))
        results = cursor.fetchall()
        cursor.close()
        return [Customer(**row) for row in results]
