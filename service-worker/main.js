if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
            .then(function (registration) {
                // 注册成功
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(function (err) {
                // 注册失败:(
                console.log('ServiceWorker registration failed: ', err);
            });
    });

    this.addEventListener('install', function (event) {
        event.waitUntil(
            caches.open('my-test-cache-v1').then(function (cache) {
                return cache.addAll([
                    '/',
                    '/index.html',
                    '/main.css',
                    '/main.js',
                    '/image.jpg'
                ]);
            })
        );
    });

    this.addEventListener('fetch', function (event) {
        event.respondWith(
            caches.match(event.request).then(function (response) {
                // 来来来，代理可以搞一些代理的事情

                // 如果 service worker 有自己的返回，就直接返回，减少一次 http 请求
                if (response) {
                    return response;
                }

                // 如果 service worker 没有返回，那就得直接请求真是远程服务
                var request = event.request.clone(); // 把原始请求拷过来
                return fetch(request).then(function (httpRes) {

                    // http请求的返回已被抓到，可以处置了。

                    // 请求失败了，直接返回失败的结果就好了。。
                    if (!httpRes && httpRes.status !== 200) {
                        return response;
                    }

                    // 请求成功的话，再一次缓存起来。
                    var responseClone = httpRes.clone();
                    caches.open('my-test-cache-v1').then(function (cache) {
                        cache.put(event.request, responseClone);
                    });

                    return httpRes;
                });
            })
        );
    });

}
