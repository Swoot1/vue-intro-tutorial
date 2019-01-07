var eventBus = new Vue();

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `<div class="product">
    <div class="product-image">
        <img :src="image">
    </div>
    <div class="product-info">
        <h1>{{ title }}</h1>
        <span v-show="inStock"
              :class="{ erasedText: !inStock }"> In stock! </span>        
        <p>User is premium: {{ premium }}
        <ul>
            <li v-for="detail in details">
                {{ detail }}
            </li>
        </ul>
        <div v-for="(variant, index) in variants" 
                :key="variant.variantId"
                class="color-box"
                :style="{ backgroundColor: variant.variantColor }"
                @click="updateProduct(index)">
        </div>
        <button v-on:click="addToCart" 
                :disabled="!inStock"
                :class="{ disabledButton:!inStock }">Add to Cart</button>
        <button v-on:click="removeFromCart">Remove from Cart</button>    
        <product-tabs :reviews="reviews"></product-tabs>                
    </div>
</div> `,
    data(){
        return {
            brand: 'Vue Mastery',
            product: 'Socks',
            selectedVariant: 0,
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            reviews: [],
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: './images/socks-green.jpeg',
                    variantQuantity: 1337
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: './images/socks-blue.jpeg',
                    variantQuantity: 12   
                }
            ]
        };
    },
    methods: {
        addToCart(){
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
        },
        removeFromCart(){
            this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index){
            this.selectedVariant = index;
        }
    },
    computed: {
        title(){
            return this.brand + ' ' + this.product;
        },
        image() { 
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity > 0;
        }
    },
    mounted(){
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    }
});

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array, 
            required: true
        }
    },
    template: `
        <div>
            <span class="tab" 
                  v-for="(tab, index) in tabs" 
                  :key="index"
                  :class="{ activeTab: selectedTab === tab }"
                  @click="selectedTab = tab">
                  {{ tab }}</span>

            <div v-show="selectedTab === 'Reviews'">
                <h2>Reviews</h2>
                <p v-if="!reviews.length">There are no reviews yet</p>
                <ul>
                    <li v-for="review in reviews">
                        <p>{{ review.name }}</p>
                        <p>{{ review.review }}</p>
                        <p>Rating: {{ review.rating }}</p>
                        <p v-if="review.wouldRecommend">Would recommend this product</p>
                        <p v-else>Would not recommend this product.</p>
                    </li>
                </ul>
            </div>
            <product-review v-show="selectedTab === 'Make a review'"></product-review> 

        </div>
    `,
    data(){    
        return {
            tabs: ['Reviews', 'Make a review'],
            selectedTab: 'Reviews'
        };
    }
});

Vue.component('product-review', {
    template: `
    <form class="review-form"
          @submit.prevent="onSubmit">
        <div v-if="errors.length">
            <p>Please correct these error(s): </p>
            <ul>
                <li v-for="error in errors"> {{ error }} </li>
            </ul>
        </div>
        <p>
            <label for="name"> Name: </label>
            <input id="name" 
                   v-model="name">
        </p>
        <p>
            <label for="review">Review: </label>
            <textarea id="review" 
                      v-model="review"></textarea>
        </p>
        <p>
            <label for="rating"> Rating: </label>
            <select id="rating" 
                    v-model.number="rating">
                <option>5</option>
                <option>4</option>
                <option>3</option>
                <option>2</option>
                <option>1</option>
            </select>
        </p>
        <p>Would you recommend this product?</p>
        <label>
            <input type="checkbox"
                   v-model.boolean="wouldRecommend">
        </label>
        <input type="submit">
    </form>
    `,
    data(){
        return {
            name: null,
            review: null,
            rating: null,
            wouldRecommend: null,
            errors: []
        };
    },
    methods: {
        onSubmit(){
           this.errors = [];
           if(this.name && this.rating && this.review 
            && (this.wouldRecommend === true || this.wouldRecommend === false)){
                let productReview = {
                    name: this.name, 
                    rating: this.rating, 
                    review: this.review,
                    wouldRecommend: this.wouldRecommend
                };

                eventBus.$emit('review-submitted', productReview);

                this.name = null;
                this.rating = null;
                this.review = null;
           } else {
               if(!this.name){
                   this.errors.push('Name required');
               }

                if(!this.rating){
                    this.errors.push('Rating required');
                }

                if(!this.review){
                    this.errors.push('Review required');
                }

                if(this.wouldRecommend !== true && this.wouldRecommend !== false){
                    this.errors.push('Would recommend required');
                }
           }
        }
    }

});
const app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        updateCart(id){
            this.cart.push(id)
        },
        removeFromCart(id){
            const indexOfItem = this.cart.indexOf(id);
            const itemIsNotInCart = indexOfItem === -1;
            if(itemIsNotInCart) {
                return;
            }

            this.cart.splice(indexOfItem, 1);
        }
    }
});