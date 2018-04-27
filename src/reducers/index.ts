import { Map } from 'immutable';
import {
    createStore,
    combineReducers,
    applyMiddleware,
    compose,
} from 'redux';
import thunkMiddleware from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web and AsyncStorage for react-native
const immutableTransform = require('redux-persist-transform-immutable');

import { Contact } from '../models/Contact';
import { User } from '../models/User';
import { ActionTypes, timeTick, generateContactRandom } from '../actions/Actions';

export interface AppState {
    contacts: Map<string, Contact>;
    user: User;
    currentTimestamp: number;
    contactRandom: string;
}

interface Contacts {
    [key: number]: Contact;
}

const now = Date.now();
const Sec = 1000;
const defaultContacts = Map<string, Contact>({
});

const defaultUser: User = {
    name: '',
    identity: {
        publicKey: '',
        privateKey: '',
    },
};

const defaultState: AppState = {
    contacts: defaultContacts,
    user: defaultUser,
    currentTimestamp: Date.now(),
    contactRandom: '',
};

const contactsReducer = (contacts: Map<string, Contact> = defaultContacts, action: ActionTypes): Map<string, Contact> => {
    switch (action.type) {
        case 'UPDATE-CONTACT-LAST-SEEN': {
            const contact = contacts.get(action.publicKey);
            const updatedContact = {
                ...contact,
                lastSeen: action.lastSeen,
            };
            return contacts.set(updatedContact.publicKey, updatedContact);
        }
        case 'UPDATE-CONTACT-NAME': {
            const contact = contacts.get(action.publicKey);
            const updatedContact = {
                ...contact,
                name: action.name,
            };
            return contacts.set(updatedContact.publicKey, updatedContact);
        }
        case 'UPDATE-CONTACT-STATE': {
            const contact = contacts.get(action.publicKey);
            const updatedContact = {
                ...contact,
                state: action.state,
            };
            return contacts.set(updatedContact.publicKey, updatedContact);
        }
        case 'CREATE-CONTACT': {
            const contact: Contact = {
                type: 'person',
                name: action.name,
                state: action.state,
                publicKey: action.publicKey,
                lastSeen: Date.now(),
                knownSince: Date.now(),
            };
            return contacts.set(contact.publicKey, contact);
        }
    }
    return contacts;
};

const testUserAlice: User = {
    name: 'Alice',
    identity: {
        publicKey: '1ea6acca71e091b837b77e7e0e7ad3395d79ae8b06539273e2f169efffd07236f6bfac5a70b32aebfd56fa1768fa25873a66eeeca0b833d48ace5619f002c156',
        privateKey: '0x99bdf6666b1c9f16a8688c4f60ad5c074b13a8b9671e984c4db5bcf2e9000408',
    },
    ephemeralIdentity: {
        publicKey: '902589716f5f9ededa8180aca847f8f0110bfac0393de0cd6ccef44508216425debb9bd4c85a6b3bb248ea83a5baf9ad1456f33f6e6c8868f5a7568827971450',
        privateKey: '0x7689513ebbf179b6fc2751f032d97103e7c7ba7b5846c5529d5f9a1aded18096',
    },
};

export const testUserBob: User = {
    name: 'Bob',
    identity: {
        publicKey: 'c5d9a8210a1234b59aafab5ae1dce4925e56fac47b776b2d9a62cd86ef9d61470075191a5979caba245c83c4d4d39c81b590ecf724c86fc90e5dc6b5522f3c58',
        privateKey: '0xa74ffa9b0a79548c4103fd6e2181cce4659f2bd94e5db66ad99bf1da08124618',
    },
    ephemeralIdentity: {
        publicKey: 'a99ee5595fd47198f1c7c0094304264c222b103b46982bd131f50764a80b200931df6df06dc4158f213e9859109e32d63b6899b9c39982ea91e782f8b417492c',
        privateKey: '0x7b5490a5d974237f4ce0ad78b4df3c69dceb455747feea91cc03416d646b8294',
    },
};

const userReducer = (user: User = defaultUser, action: ActionTypes): User => {
    switch (action.type) {
        case 'CREATE-USER': {
            const name = action.name.toLowerCase();
            if (name === testUserAlice.name.toLowerCase()) {
                return testUserAlice;
            }
            if (name === testUserBob.name.toLowerCase()) {
                return testUserBob;
            }
            return {
                name: action.name,
                identity: {
                    publicKey: 'e8869123ec894bfb8bce8dc3b083ecde6ba16abe3ea7ff2b32ca62eaded164bdf3aae44766c1431477d570378e81cb3fb674ae7dcdcb4257abdd1491f12641b8',
                    privateKey: '0x45e1805a7b6eee384820ac97c90b39c51265ac8e39715fa8d76a4f71fdb90def',
                },
                ephemeralIdentity: {
                    publicKey: '8a6cf93a2f199009db635a03e4d7b8a2fad4c9044ad237aba723e459b32d362d46b9848fa2525df47a502fe68777ab368e5be85f609b756e28afb8620a5551ba',
                    privateKey: '0xc685320e66ad6cdff4ecd5dc842fb24812e2c6dd87558cd28c48d7f1280bd085',
                },
            };
        }
    }
    return user;
};

const currentTimestampReducer = (currentTimestamp: number = Date.now(), action: ActionTypes): number => {
    switch (action.type) {
        case 'TIME-TICK': {
            return action.currentTimestamp;
        }
    }
    return currentTimestamp;
};

const contactRandomReducer = (contactRandom: string = '', action: ActionTypes): string => {
    switch (action.type) {
        case 'UPDATE-CONTACT-RANDOM': {
            return action.random;
        }
    }
    return contactRandom;
};

export const reducer = combineReducers<AppState>({
    contacts: contactsReducer,
    user: userReducer,
    currentTimestamp: currentTimestampReducer,
    contactRandom: contactRandomReducer,
});

const persistConfig = {
    transforms: [immutableTransform({
        blacklist: ['currentTimestamp', 'contactRandom'],
    })],
    key: 'root',
    storage,
};

const persistedReducer = persistReducer(persistConfig, reducer) as any;

export const store = createStore(
    persistedReducer,
    defaultState,
    compose(
        applyMiddleware(thunkMiddleware),
    ),
);
// store.subscribe(() => console.log(store.getState()));

export const persistor = persistStore(store);

setInterval(() => store.dispatch(timeTick(Date.now()), 1000));
store.dispatch(generateContactRandom());
