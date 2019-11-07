import Vue from 'vue';
import { Autocomplete, Row, Col } from 'element-ui';
import lang from 'element-ui/lib/locale/lang/en';
import locale from 'element-ui/lib/locale';

locale.use(lang);

Vue.use(Autocomplete);
Vue.use(Row);
Vue.use(Col);
