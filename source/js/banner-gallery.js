// 爬取的随机图库（dmoe.cc），共 76 张
var RANDOM_IMAGES = [
  "https://tvax1.sinaimg.cn/large/005WQYV9gy1fqdf874afuj31hc0u0qis.jpg",
  "https://tvax1.sinaimg.cn/large/0072Vf1pgy1fodqgm91nsj315o0xr4qq.jpg",
  "https://tvax1.sinaimg.cn/large/0072Vf1pgy1fodqn34by0j31hc0xcqg9.jpg",
  "https://tvax1.sinaimg.cn/large/0072Vf1pgy1fodqngr3vjj31kw0zkhdt.jpg",
  "https://tvax1.sinaimg.cn/large/0072Vf1pgy1fodqnpms36j31hc0u0b2a.jpg",
  "https://tvax1.sinaimg.cn/large/0072Vf1pgy1fodqofmtxkj31kw0w04qv.jpg",
  "https://tvax1.sinaimg.cn/large/0072Vf1pgy1foxk3pfp31j31hc0u0kas.jpg",
  "https://tvax1.sinaimg.cn/large/0072Vf1pgy1foxk77bbbvj31hc0u0wuv.jpg",
  "https://tvax1.sinaimg.cn/large/0072Vf1pgy1foxkcf9mfnj31hc0u0h7p.jpg",
  "https://tvax1.sinaimg.cn/large/0072Vf1pgy1foxkcpa9qqj31kw0w07sa.jpg",
  "https://tvax1.sinaimg.cn/large/0072Vf1pgy1foxkfqehi6j31hc0u0184.jpg",
  "https://tvax1.sinaimg.cn/large/0072Vf1pgy1foxkfttdj5j31hc0u0k5l.jpg",
  "https://tvax1.sinaimg.cn/large/0072Vf1pgy1foxkfylhhxj31hc0u04dv.jpg",
  "https://tvax1.sinaimg.cn/large/0072Vf1pgy1foxkg7cbi8j31kw0w07tz.jpg",
  "https://tvax1.sinaimg.cn/large/a15b4afegy1fmvj0f2g5pj21hc0u0apl.jpg",
  "https://tvax1.sinaimg.cn/large/a15b4afegy1fmvjgnzla1j21hc0u04qp.jpg",
  "https://tvax1.sinaimg.cn/large/a15b4afegy1fmvjhbx6b6j21hc0u0tgu.jpg",
  "https://tvax1.sinaimg.cn/large/a15b4afegy1fmvjlgdxxgj21hc0u04qp.jpg",
  "https://tvax1.sinaimg.cn/large/a15b4afegy1fmvk5t6cwbj21hc0u0wwo.jpg",
  "https://tvax2.sinaimg.cn/large/0072Vf1pgy1fodqmy1m4nj31kw0uzhdx.jpg",
  "https://tvax2.sinaimg.cn/large/0072Vf1pgy1foxk3v1l7zj31kw0w0hbx.jpg",
  "https://tvax2.sinaimg.cn/large/0072Vf1pgy1foxk43c7brj31hc0u0aw8.jpg",
  "https://tvax2.sinaimg.cn/large/0072Vf1pgy1foxk6gxodwj31kw0w0h7z.jpg",
  "https://tvax2.sinaimg.cn/large/0072Vf1pgy1foxk6nwijlj31kw0w0ttc.jpg",
  "https://tvax2.sinaimg.cn/large/0072Vf1pgy1foxk6u83cvj31hc0u0wxh.jpg",
  "https://tvax2.sinaimg.cn/large/0072Vf1pgy1foxk6w32z2j31kw0w04nn.jpg",
  "https://tvax2.sinaimg.cn/large/0072Vf1pgy1foxk7r8ic6j31hc0u0k7b.jpg",
  "https://tvax2.sinaimg.cn/large/0072Vf1pgy1foxkf5ytavj31kw0w0ts3.jpg",
  "https://tvax2.sinaimg.cn/large/0072Vf1pgy1foxkfa3isfj31kw0w0ay4.jpg",
  "https://tvax2.sinaimg.cn/large/0072Vf1pgy1foxkg94nzbj31kw0w0hcf.jpg",
  "https://tvax2.sinaimg.cn/large/0072Vf1pgy1foxki4cli7j31kw0w0kgr.jpg",
  "https://tvax2.sinaimg.cn/large/0072Vf1pgy1foxkioq4i5j31hc0u0e1o.jpg",
  "https://tvax2.sinaimg.cn/large/0072Vf1pgy1foxkiv5gzwj31hc0u0ncg.jpg",
  "https://tvax2.sinaimg.cn/large/0072Vf1pgy1foxkiztofjj31hc0u07g2.jpg",
  "https://tvax2.sinaimg.cn/large/0072Vf1pgy1foxkjcneg1j31kw0w0hbs.jpg",
  "https://tvax2.sinaimg.cn/large/0072Vf1pgy1foxli3blnaj31kw0w0b0x.jpg",
  "https://tvax2.sinaimg.cn/large/0072Vf1pgy1foxlnyr3elj31hc0u0nis.jpg",
  "https://tvax2.sinaimg.cn/large/0072Vf1pgy1foxlohgkwfj31hc0u0k69.jpg",
  "https://tvax2.sinaimg.cn/large/a15b4afegy1fmvjblgi3qj21hc0u0dst.jpg",
  "https://tvax2.sinaimg.cn/large/a15b4afegy1fmvjcoopcsj21hc0u04nh.jpg",
  "https://tvax2.sinaimg.cn/large/a15b4afely1fnt9m9avezj21hc0u0twg.jpg",
  "https://tvax3.sinaimg.cn/large/005FzdTdgy1gegf7mm8qdj31hc0u07d6.jpg",
  "https://tvax3.sinaimg.cn/large/0072Vf1pgy1fodqn2e7bvj318g0p0qv5.jpg",
  "https://tvax3.sinaimg.cn/large/0072Vf1pgy1fodqnt870uj31kf14ex6p.jpg",
  "https://tvax3.sinaimg.cn/large/0072Vf1pgy1fodqp1fcr6j315o0u0kjl.jpg",
  "https://tvax3.sinaimg.cn/large/0072Vf1pgy1foxk7hw45cj31hc0u0nhq.jpg",
  "https://tvax3.sinaimg.cn/large/0072Vf1pgy1foxkcq79psj31kw0w01h6.jpg",
  "https://tvax3.sinaimg.cn/large/0072Vf1pgy1foxkf2ckn5j31hc0u0nkl.jpg",
  "https://tvax3.sinaimg.cn/large/0072Vf1pgy1foxkfcikvsj31hc0u0ar1.jpg",
  "https://tvax3.sinaimg.cn/large/0072Vf1pgy1foxkfnmbgcj31kw0w0qsa.jpg",
  "https://tvax3.sinaimg.cn/large/0072Vf1pgy1foxkft70qtj31hc0u0tqy.jpg",
  "https://tvax3.sinaimg.cn/large/0072Vf1pgy1foxkibab1zj31hc0u0dy7.jpg",
  "https://tvax3.sinaimg.cn/large/0072Vf1pgy1foxkieg2ntj31kw0w07su.jpg",
  "https://tvax3.sinaimg.cn/large/0072Vf1pgy1foxlholn3ej31hc0u0qnp.jpg",
  "https://tvax3.sinaimg.cn/large/0072Vf1pgy1foxli1p0fxj31hc0u0nmj.jpg",
  "https://tvax3.sinaimg.cn/large/0072Vf1pgy1foxlo4q77mj31kw0w0kev.jpg",
  "https://tvax3.sinaimg.cn/large/a15b4afegy1fmvj7rb7eoj21hc0u0jx5.jpg",
  "https://tvax3.sinaimg.cn/large/a15b4afegy1fmvjh2277rj21hc0u0woz.jpg",
  "https://tvax3.sinaimg.cn/large/a15b4afegy1fmvjk8e18pj21hc0u019s.jpg",
  "https://tvax4.sinaimg.cn/large/005FzdTdgy1geesy5jf3uj31hc0u0b29.jpg",
  "https://tvax4.sinaimg.cn/large/005FzdTdgy1geetguxsutj31hc0u0hdt.jpg",
  "https://tvax4.sinaimg.cn/large/005FzdTdgy1gegf7m0ds2j31hc0u0jw2.jpg",
  "https://tvax4.sinaimg.cn/large/0072Vf1pgy1fodqik1606j31kw0zk4qq.jpg",
  "https://tvax4.sinaimg.cn/large/0072Vf1pgy1foxk3r1oj8j31hc0u0arg.jpg",
  "https://tvax4.sinaimg.cn/large/0072Vf1pgy1foxk70rdinj31kw0w0b19.jpg",
  "https://tvax4.sinaimg.cn/large/0072Vf1pgy1foxk7qmowmj31hc0u0wrv.jpg",
  "https://tvax4.sinaimg.cn/large/0072Vf1pgy1foxkc3khj2j31kw0w0x48.jpg",
  "https://tvax4.sinaimg.cn/large/0072Vf1pgy1foxkcawolsj31hc0u07n6.jpg",
  "https://tvax4.sinaimg.cn/large/0072Vf1pgy1foxkihz4b4j31hc0u0wux.jpg",
  "https://tvax4.sinaimg.cn/large/0072Vf1pgy1foxkjenkjaj31hc0u0dwt.jpg",
  "https://tvax4.sinaimg.cn/large/0072Vf1pgy1foxlhpidhbj31hc0u0qkv.jpg",
  "https://tvax4.sinaimg.cn/large/008DhhDngy1iats7b7s2bj31jk13ab29.jpg",
  "https://tvax4.sinaimg.cn/large/a15b4afegy1fmvj0m0n6mj21hc0u0dnf.jpg",
  "https://tvax4.sinaimg.cn/large/a15b4afegy1fmvj2mu43nj21hc0u0nca.jpg",
  "https://tvax4.sinaimg.cn/large/a15b4afegy1fmvj5dpdz6j21hc0u0nba.jpg",
  "https://tvax4.sinaimg.cn/large/a15b4afegy1fmvjjphlyyj21hc0u0h4m.jpg",
];

// 完全随机：每次页面加载时，从图库随机挑一张设为 banner
// 每个 <img> 独立随机，保证各栏目图片不同
(function() {
  function pick() {
    return RANDOM_IMAGES[Math.floor(Math.random() * RANDOM_IMAGES.length)];
  }
  function apply() {
    // 处理所有 banner 位（包括 lazyload 的 data-src）
    document.querySelectorAll('img').forEach(function(img) {
      var src = img.getAttribute("src") || "";
      var dsrc = img.getAttribute("data-src") || "";
      var isBanner = src.indexOf("dmoe.cc") >= 0 || dsrc.indexOf("dmoe.cc") >= 0;
      if (!isBanner) return;
      var url = pick();
      // 正在显示的 src 直接换
      if (src.indexOf("dmoe.cc") >= 0) img.src = url;
      // lazyload 的 data-src 也换
      if (dsrc.indexOf("dmoe.cc") >= 0) img.setAttribute("data-src", url);
      // 失败回退
      img.onerror = function() { img.onerror = null; img.src = "/images/banner.webp"; };
    });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();
