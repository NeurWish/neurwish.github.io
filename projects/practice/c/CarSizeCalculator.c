#include <stdio.h>
#include <math.h>

// 每個乘客需要的空間（單位: cm）
#define PERSON_LENGTH 80 // 每人前後所需長度
#define PERSON_WIDTH 60  // 每人左右所需寬度
#define PERSON_HEIGHT 120 // 每人所需高度

void calculateCarSize(int numPeople) {
    int rows = (int)ceil(numPeople / 2.0); // 每排坐2人
    int carLength = rows * PERSON_LENGTH;  // 車輛總長度
    int carWidth = PERSON_WIDTH * 2;       // 假設車寬度為兩人座
    int carHeight = PERSON_HEIGHT;         // 車輛高度

    printf("需要的車輛尺寸:\n");
    printf("長度: %d cm\n", carLength);
    printf("寬度: %d cm\n", carWidth);
    printf("高度: %d cm\n", carHeight);
}

int main() {
    int numPeople;

    printf("請輸入人數: ");
    if (scanf("%d", &numPeople) != 1) {
        printf("輸入無效！請輸入數字。\n");
        return 1;
    }

    calculateCarSize(numPeople);

    return 0;
}
