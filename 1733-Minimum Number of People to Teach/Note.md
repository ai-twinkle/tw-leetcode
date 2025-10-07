# 1733. Minimum Number of People to Teach

On a social network consisting of `m` users and some friendships between users, two users can communicate with each other if they know a common language.

You are given an integer `n`, an array `languages`, and an array `friendships` where:

- There are `n` languages numbered `1` through `n`,
- `languages[i]` is the set of languages the $i^{th}$ user knows, and
- `friendships[i] = [u_i, v_i]` denotes a friendship between the users `u_i` and `v_i`.

You can choose one language and teach it to some users so that all friends can communicate with each other. 
Return the minimum number of users you need to teach.

Note that friendships are not transitive, meaning if `x` is a friend of `y` and `y` is a friend of `z`, this doesn't guarantee that `x` is a friend of `z`.

**Constraints:**

- `2 <= n <= 500`
- `languages.length == m`
- `1 <= m <= 500`
- `1 <= languages[i].length <= n`
- `1 <= languages[i][j] <= n`
- `1 <= u_i < v_i <= languages.length`
- `1 <= friendships.length <= 500`
- All tuples `(u_i, v_i)` are unique
- `languages[i]` contains only unique values

## 基礎思路

本題的目標是挑選一種語言，教給最少數量的使用者，使所有「彼此為朋友」的使用者都能溝通。要注意溝通關係僅限於友誼邊本身、**不具傳遞性**。因此策略如下：

1. 只需關注那些「至少有一條友誼邊無共同語言」的使用者；其他人即使不學也不影響任何友誼邊的溝通。
2. 在這些被標記的使用者中，統計每一種語言已被多少人掌握；若選擇教某語言，則只需把該語言教給「未掌握該語言的被標記使用者」。
3. 為使教學人數最少，應選擇「在被標記人群中已知人數最多」的語言。答案即為：被標記人數 − 被標記人群中對此語言的已知人數最大值。

為了高效判定兩位使用者是否有共同語言，我們先建立一個可 **O(1)** 查詢的語言歸屬表，之後在掃描每條友誼邊時只需枚舉其中一位的語言清單並查表，比逐語言交集要快。

## 解題步驟

### Step 1：建立 O(1) 語言查表（初始化與填表）

先記下使用者數量，建立「平坦化」的語言成員矩陣，並依 `languages` 將使用者會的語言填入，之後可用常數時間查詢「某使用者是否會某語言」。

```typescript
const userCount = languages.length;

// 平坦化矩陣用於 O(1) 查詢：membershipMatrix[userId * stride + languageId] = 1 代表使用者會此語言
const languageStride = n + 1;
const membershipMatrix = new Uint8Array((userCount + 1) * languageStride);

// 依使用者已知語言填滿成員矩陣
for (let userId = 1; userId <= userCount; userId++) {
  const languageList = languages[userId - 1];
  for (
    let languageIndex = 0, languageListLength = languageList.length;
    languageIndex < languageListLength;
    languageIndex++
  ) {
    const languageId = languageList[languageIndex];
    membershipMatrix[userId * languageStride + languageId] = 1;
  }
}
```

### Step 2：掃描每條友誼邊，標記「需要教學」的使用者

逐條友誼邊判斷兩人是否已有共同語言。為加速，枚舉語言較少的一方，對另一方用查表判定。若沒有共同語言，將兩位使用者標記為可能需要教學，並統計被標記總數。

```typescript
// 追蹤存在至少一條無共同語言友誼的使用者
const needsTeaching = new Uint8Array(userCount + 1);
let needsTeachingCount = 0;

const friendshipCount = friendships.length;
for (let friendshipIndex = 0; friendshipIndex < friendshipCount; friendshipIndex++) {
  const friendshipPair = friendships[friendshipIndex];
  const userA = friendshipPair[0];
  const userB = friendshipPair[1];

  const languagesOfUserA = languages[userA - 1];
  const languagesOfUserB = languages[userB - 1];

  let canCommunicate = false;

  // 檢查兩人是否存在至少一種共同語言
  if (languagesOfUserA.length <= languagesOfUserB.length) {
    const baseOffset = userB * languageStride;
    for (
      let languageIndex = 0, languageListLength = languagesOfUserA.length;
      languageIndex < languageListLength;
      languageIndex++
    ) {
      const languageId = languagesOfUserA[languageIndex];
      if (membershipMatrix[baseOffset + languageId] !== 0) {
        canCommunicate = true;
        break;
      }
    }
  } else {
    const baseOffset = userA * languageStride;
    for (
      let languageIndex = 0, languageListLength = languagesOfUserB.length;
      languageIndex < languageListLength;
      languageIndex++
    ) {
      const languageId = languagesOfUserB[languageIndex];
      if (membershipMatrix[baseOffset + languageId] !== 0) {
        canCommunicate = true;
        break;
      }
    }
  }

  // 若兩人無法溝通，將兩位使用者標記為可能需要教學
  if (!canCommunicate) {
    if (needsTeaching[userA] === 0) {
      needsTeaching[userA] = 1;
      needsTeachingCount++;
    }
    if (needsTeaching[userB] === 0) {
      needsTeaching[userB] = 1;
      needsTeachingCount++;
    }
  }
}
```

### Step 3：早停判斷

若沒有任何被標記者，代表所有友誼邊皆已可溝通，直接回傳 0。

```typescript
// 若所有朋友組合皆可溝通，直接回傳 0
if (needsTeachingCount === 0) {
  return 0;
}
```

### Step 4：統計被標記者中各語言的覆蓋數

只在被標記者集合中，計算每種語言已被幾人掌握，為後續挑選最佳語言做準備。

```typescript
// 統計在「需要教學」的人群中，各語言已被多少人掌握
const alreadyKnowCounts = new Uint16Array(n + 1);
for (let userId = 1; userId <= userCount; userId++) {
  if (needsTeaching[userId] === 0) {
    continue;
  }
  const languageList = languages[userId - 1];
  for (
    let languageIndex = 0, languageListLength = languageList.length;
    languageIndex < languageListLength;
    languageIndex++
  ) {
    const languageId = languageList[languageIndex];
    alreadyKnowCounts[languageId]++;
  }
}
```

### Step 5：找出在被標記者中最常見的語言

線性掃描語言 1…n，取得最大覆蓋數。

```typescript
// 在被標記者中，找出已被最多人掌握的語言
let maximumAlreadyKnow = 0;
for (let languageId = 1; languageId <= n; languageId++) {
  const countForLanguage = alreadyKnowCounts[languageId];
  if (countForLanguage > maximumAlreadyKnow) {
    maximumAlreadyKnow = countForLanguage;
  }
}
```

### Step 6：計算最少教學人數並回傳

若選擇該最常見語言，只需教給「被標記總數 − 已會此語言的人數」即可。

```typescript
// 教此最常見語言給其餘被標記者
return needsTeachingCount - maximumAlreadyKnow;
```

## 時間複雜度

- 建表：遍歷所有使用者的語言清單，為 $\sum_i |languages[i]|$。
- 檢查友誼邊：對每條邊只枚舉語言較少的一方，成本為 $\sum_{(u,v)} \min(|L_u|,|L_v|)$，查表為 $O(1)$。
- 統計與取最大：僅對被標記者再掃其語言清單（$\le \sum_i |languages[i]|$）與一次 $O(n)$ 的取最大。
- 總時間複雜度為 $O(\sum_i |languages[i]| + \sum_{(u,v)} \min(|L_u|,|L_v|) + n)$。

> $O(\sum_i |languages[i]| + \sum_{(u,v)} \min(|L_u|,|L_v|) + n)$

## 空間複雜度

- 平坦化成員矩陣需要 $O(m \times n)$ 空間，另有 `needsTeaching` 為 $O(m)$、`alreadyKnowCounts` 為 $O(n)$，整體受 $O(m \times n)$ 主導。
- 總空間複雜度為 $O(m \times n)$。

> $O(m \times n)$
