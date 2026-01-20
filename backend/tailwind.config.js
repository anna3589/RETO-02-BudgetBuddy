import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            
            colors: {
                primary: '#217a4a',      // Tu verde principal
                'primary-dark': '#1a603a', // Tu verde oscuro (hover)
                secondary: '#f4f4f4',
            }
            // ------------------
        },
    },

    plugins: [forms],
};