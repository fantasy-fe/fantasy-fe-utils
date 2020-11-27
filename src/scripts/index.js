const BMI_FAT_RANGE = [24.0, 27.9];

class User {
    constructor(id, bmi) {
        this.id = id;
        this.bmi = bmi;
    }

    isFat() {
        return this.bmi >= BMI_FAT_RANGE[0] && this.bmi <= BMI_FAT_RANGE[1];
    }
}

class UserManager {
    constructor(users) {
        this.users = users;
    }

    removeFatUsers() {
        let normalUsers = [];
        // for (let i = 0; i < this.users.length; i++) {
        //     let user = this.users[i];
        //     if (!user.isFat()) {
        //         //this.users.splice(i, 1);
        //       normalUsers.push(user);
        //     }
        // }
        normalUsers = (this.users.filter((user) => {return !user.isFat()}));
        this.users = normalUsers;
    }

    getUsersBmiDifferIs(differ) {
        this.users.sort((a, b) => a.bmi - b.bmi);
        let result = [];
        for (let i = 1; i < this.users.length; i++) {
            let currUser = this.users[i];
            let prevUser = this.users[i - 1];
            if (parseFloat((currUser.bmi - prevUser.bmi).toFixed(1)) == differ) {
                result.push([prevUser, currUser]);
            }
        }
        return result;
    }

    static generateUserData() {
        let bmis = [18.5, 26.5, 18.5, 20.2, 20.3, 24.8, 20.9, 21.3, 21.8, 25.2];
        let users = [];
        for (let i = 0; i < bmis.length; i++) {
            users.push(new User(i + 1, bmis[i]));
        }
        return users;
    }
}

(function foo() {
    debugger;
    let users = UserManager.generateUserData();
    let userManager = new UserManager(users);
    console.log('：');
    console.log(users);
    console.log('========');
    // 找出 BMI 相差 0.1 的用户;
    // 正确的输出结果 [4:20.2, 5:20.3];
    console.log('BMI 相差 0.1 的用户：');
    console.log(userManager.getUsersBmiDifferIs(0.1));
    console.log('========');
    // 移除肥胖的用户;
    // 肥胖的用户 [2:26.5, 6:24.8, 10:25.2];
    // 正确的输出结果 [1:18.5, 3:18.5, 4:20.2, 5:20.3, 7:20.9, 8:21.3, 9:21.8];
    console.log('健康的用户：');
    userManager.removeFatUsers();
    console.log(userManager.users);
}());