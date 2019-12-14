(() => {
    // This is to connect to the server: 
    // io() is a functon that is accessible from the script which path is: /socket.io/socket.io.j
    const socket = io();

    // Elements
    const $messageForm = document.querySelector('#message-form');
    const $messageFormInput = $messageForm.querySelector('#message');
    const $messageFormButton = $messageForm.querySelector('button');
    const $sendLocationButton = document.querySelector('#send-location');
    const $messages = document.querySelector('#messages');
    const $sidebar = document.querySelector('.chat__sidebar');

    // Templates
    const messageTemplate = document.querySelector('#message-template').innerHTML;
    const locationTemplate = document.querySelector('#location-template').innerHTML;
    const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

    // Options
    const { room, name } = Qs.parse(location.search, { ignoreQueryPrefix: true });

    const autoScroll = () => {
        const $newMessage = $messages.lastElementChild;
        const newMessageStyles = getComputedStyle($newMessage);
        const newMessageMargin = parseInt(newMessageStyles.marginBottom);
        const newMessageheight = $newMessage.offsetHeight + newMessageMargin;

        const visibleHeight = $messages.offsetHeight;
        const containerHeight = $messages.scrollHeight;
        const scrollOffset = $messages.scrollTop + visibleHeight; 

        if (containerHeight - newMessageheight <= scrollOffset) {
            messages.scrollTop = $messages.scrollHeight;
        }
    }

    socket.on('message', (message) => {
        const html = Mustache.render(messageTemplate, {
            message: message.text,
            username: message.username,
            createdAt: moment(message.createdAt).format('h:mm a')
        });
        $messages.insertAdjacentHTML('beforeend', html);
        autoScroll();
    });

    socket.on('locationMessage', (message) => {
        const html = Mustache.render(locationTemplate, {
            locationUrl: message.url,
            username: message.username,
            createdAt: moment(message.createdAt).format('h:mm a')
        });
        $messages.insertAdjacentHTML('beforeend', html);
    })

    $messageForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const message = $messageFormInput.value;
        $messageFormInput.value = '';

        $messageFormButton.setAttribute('disabled', true);

        socket.emit('sendMessage', message, (error) => {
            if (error) {
                return console.error(error);
            }
            console.log('Your message was delivered');
            $messageFormButton.removeAttribute('disabled');
        });
    });

    $sendLocationButton.addEventListener('click', function(e) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((location) => {
                const { latitude, longitude } = location.coords;
                this.setAttribute('disabled', true);
                socket.emit('sendLocation', { latitude, longitude }, () => {
                    this.removeAttribute('disabled');
                });
            });
        }
    });

    socket.emit('join', { name, room }, (error) => {
        if (error) {
            alert(error);
            location.href = '/';
        }
    });

    socket.on('roomData', ({ room, users }) => {
        console.log(users);
        $sidebar.innerHTML = '';
        const html = Mustache.render(sidebarTemplate, {
            room, 
            users
        });
        $sidebar.insertAdjacentHTML('beforeend', html);
    });
})();