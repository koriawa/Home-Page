// 获取DOM元素
const NavLinks = document.querySelectorAll('.nav-link');
const CardContainers = document.querySelectorAll('.card-container');
const archivesContainer = document.getElementById('archives'); // Archives容器
let isArchivesLoaded = false; // 标记文章列表是否已加载
let isScrollListening = false; // 标记是否已添加滚动监听

console.log(`

$$$$$$$$$$W$@@$dW%$$h*b%0M@@W%WMB$$$$$$$$$
$$$$$$$$$$$&$d$&$$aB%$$M$$Om8Md0&M$$$$$$$$
$$$$$$$WB$#w$$$$$$$$$$$$$$$$k&Lm8d*$$$$$$$
$$$$$$$a&#B$$$$$$$$$$$$$$$$$$8&%M8Cl|k$$$$
$$$$$$$o$$$$$$$$$$$$$$$$$$B$$$$$qY/   $$$$
$$pn}f%$$$$$@$$$$$O$$$$$$$B$$$$$$$?  r$$$$
$$u   W$$$$$$$$$$$#*%$$$ad$$$$$$$@%  f$$$$
$$W~  #$$$$$8z$$$$$Woojq\\ZMp$$$$$$o}} $$$$
$$$\\ }8$$$$$UCU$$$$Z$$0    )%$$$$$k8r-<$$$
$$b cuB$$$&$!  }wM$a$$o\`fO_p#88B$$p@aZ 8$$
$$l#1#$$$$$0u   w$$$$$$$$#opdoWBW$Wr$UIq$$
$pw|b$$$$$$a$$ZB$$$$$$$$$$8L8M@$W$mq&Zl[%$
$&/Wa$$$$$$wnb&@$$$$$$$$$@[p$$$$a%bax{B r$
$f}##$$$$$$MrvW@$$$$$$$or|_o@k$$Lpf* X$]^M
})@ m%d$$$$8X{~ju[>xQLXxf|?bm0hzwnz$$$$uim
 c$1\`*p$$B@%U  ri   ;     x~!(/)}|U$$$$$&$
}W$o@$Obqf/Ij~YYO.       _tzbhUtjnX%$$$$aB
$$&x$$$$Jcc|a\\Ua#8i ^ ,x1CLC$&00\\nYw$$$$$c
$$#0&$$$wjo$$$$kJ] '   X(O%%$8ZQxnzj%$$$$m
$hp$$$$$a$$$$$$$$h!?.  1h%%$$80Qt\\jzqB$$$$\

-------------------------------------------------
  _  __          _ 
 | |/ /___  _ __(_)
 | ' // _ \\| '__| |
 | . \\ (_) | |  | |
 |_|\\_\\___/|_|  |_|
                   
`)
// 导航切换逻辑
NavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault(); // 阻止a标签默认跳转

        // 移除所有active状态
        NavLinks.forEach(l => l.classList.remove('active'));
        CardContainers.forEach(container => container.classList.remove('active'));

        // 激活当前导航和对应卡片
        link.classList.add('active');
        const target = link.getAttribute('data-target');
        const targetContainer = document.getElementById(target);
        if (targetContainer) {
            targetContainer.classList.add('active');

            // 根据目标加载对应数据
            if (target === "contact")
                getContactInfo();
            if (target === "websites")
                getWebSites();
            if (target === "archives")
                // 触发懒加载检查
                checkArchivesLazyLoad();
        }
    });
});

// 检查元素是否进入视口
function isElementInViewport(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    // 元素至少有一部分进入视口就返回true
    return (
        rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.bottom >= 0
    );
}

// 懒加载检查：判断是否需要加载文章列表
function checkArchivesLazyLoad() {
    // 如果已加载，直接返回
    if (isArchivesLoaded) return;

    // 如果容器在视口中，直接加载
    if (isElementInViewport(archivesContainer)) {
        getArchives();
    } else {
        // 未在视口，添加滚动监听（避免重复添加）
        if (!isScrollListening) {
            window.addEventListener('scroll', handleScroll);
            isScrollListening = true;
        }
    }
}

// 滚动监听处理函数
function handleScroll() {
    // 只有Archives容器激活时才检查
    if (archivesContainer.classList.contains('active')) {
        checkArchivesLazyLoad();
    }
}

// 加载博客文章列表
function getArchives() {
    const archiveList = document.querySelector('.archive-list');

    // 避免重复加载
    if (archiveList.children.length > 0) return;

    archiveList.innerHTML = '<p class="loading">🔄 正在加载文章列表...</p>';

    // 使用jQuery的ajax加载博客文章
    $.ajax({
        url: 'https://blog.kori.moe/wp-json/wp/v2/posts?per_page=8&page=1',
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            isArchivesLoaded = true;
            // 移除滚动监听（性能优化）
            if (isScrollListening) {
                window.removeEventListener('scroll', handleScroll);
                isScrollListening = false;
            }
            // 清空原有内容
            archiveList.innerHTML = '';
            if (!Array.isArray(data) || data.length === 0) {
                archiveList.innerHTML = '<li>暂无文章内容</li>';
                return;
            }
            for (let i = 0; i < data.length; i++) {
                // 创建文章卡片
                const post = data[i];
                const title = post.title.rendered;
                const link = post.link;

                const postDate = new Date(post.date);
                const year = postDate.getFullYear();
                const month = (postDate.getMonth() + 1).toString().padStart(2, '0');
                const day = postDate.getDate().toString().padStart(2, '0');
                const time = `${year}-${month}-${day}`;

                const li = document.createElement('li');
                li.innerHTML = `<a href="${link}" target="_blank" class="archive-item">${title} <span class="meta">/ ${time}</span></a>`;
                archiveList.appendChild(li);
            }
        },
        error: function (error) {
            console.error('加载文章列表出错:', error);
            archiveList.innerHTML = '<li>⚠️ 加载文章列表失败，请稍后重试</li>';

            isArchivesLoaded = true;
            if (isScrollListening) {
                window.removeEventListener('scroll', handleScroll);
                isScrollListening = false;
            }
        }
    });
}

// 加载联系信息
function getContactInfo() {
    const contactList = document.getElementById('contactList');
    if (!contactList || contactList.children.length > 0) return;

    fetch('./assets/data.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP错误: ${response.status}`);
            return response.json();
        })
        .then(data => {
            // 清空原有内容
            contactList.innerHTML = '';

            // 渲染联系信息
            if (data.contacts && Array.isArray(data.contacts)) {
                data.contacts.forEach(item => {
                    const li = document.createElement('li');
                    li.className = 'contact-item';

                    // 处理链接类型的联系方式
                    let valueContent = item.value || '';
                    if (valueContent.startsWith('http')) {
                        valueContent = `<a href="${valueContent}" target="_blank">${valueContent}</a>`;
                    }
                    li.innerHTML = `
                        <span class="contact-icon">${item.icon || '📱'}</span>
                        <span class="contact-type">${item.type || '未知方式'}</span>
                        <span class="contact-value">${valueContent}</span>
                    `;
                    contactList.appendChild(li);
                });
            } else {
                contactList.innerHTML = '<li class="contact-item">⚠️ 暂无联系信息</li>';
            }
        })
        .catch(error => {
            console.error('加载联系信息出错:', error);
            contactList.innerHTML = '<li class="contact-item">⚠️ 联系信息加载失败</li>';
        });
}

//  获取网站信息
function getWebSites() {
    const websitesList = document.getElementById('websiteList');
    if (!websitesList || websitesList.children.length > 0) return;

    fetch('./assets/data.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP错误: ${response.status}`);
            return response.json();
        })
        .then(data => {
            // 清空原有内容
            websitesList.innerHTML = '';

            // 渲染网站信息
            if (data.websites && Array.isArray(data.websites)) {
                data.websites.forEach(item => {
                    const li = document.createElement('li');
                    li.className = 'website-item';

                    // 处理链接类型的联系方式
                    let valueContent = item.value || '';
                    if (valueContent.startsWith('http')) {
                        valueContent = `<a href="${valueContent}" target="_blank">${valueContent}</a>`;
                    }
                    li.innerHTML = `
                        <span class="contact-icon">${item.icon || '?'}</span>
                        <span class="contact-type">${item.type || '未知'}</span>
                        <span class="contact-value">${valueContent}</span>
                    `;
                    websitesList.appendChild(li);
                });
            } else {
                websitesList.innerHTML = '<li class="contact-item">⚠️ 暂无网站信息</li>';
            }
        })
        .catch(error => {
            console.error('加载网站信息出错:', error);
            websitesList.innerHTML = '<li class="contact-item">⚠️ 网站信息加载失败</li>';
        });
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('contact').classList.contains('active')) {
        getContactInfo();
    }
    if (document.getElementById('archives').classList.contains('active')) {
        checkArchivesLazyLoad();
    }
});