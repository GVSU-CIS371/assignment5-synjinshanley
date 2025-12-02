import { defineStore } from "pinia";
import {
  BaseBeverageType,
  CreamerType,
  SyrupType,
  BeverageType,
} from "../types/beverage";
import tempretures from "../data/tempretures.json";
import bases from "../data/bases.json";
import syrups from "../data/syrups.json";
import creamers from "../data/creamers.json";
import db from "../firebase.ts";
import {
  collection,
  getDocs,
  setDoc,
  doc,
  addDoc,
  QuerySnapshot,
  QueryDocumentSnapshot,
  onSnapshot,
  Unsubscribe,
} from "firebase/firestore";
import type { User } from "firebase/auth";

export const useBeverageStore = defineStore("BeverageStore", {
  state: () => ({
    temps: tempretures,
    currentTemp: tempretures[0],
    bases: [] as BaseBeverageType[],
    currentBase: null as BaseBeverageType | null,
    syrups: [] as SyrupType[],
    currentSyrup: null as SyrupType | null,
    creamers: [] as CreamerType[],
    currentCreamer: null as CreamerType | null,
    beverages: [] as BeverageType[],
    currentBeverage: null as BeverageType | null,
    currentName: "",
    user: null as User | null,
    snapshotUnsubscribe: null as Unsubscribe | null,
  }),

  actions: {
    init() {
      const baseCollection = collection(db, "bases");
      getDocs(baseCollection)
        .then((qs: QuerySnapshot) => {
          if (qs.empty) {
            bases.forEach((b) => {
              const base = doc(db, `bases/${b.id}`);
              setDoc(base, { name: b.name, color: b.color })
                .then(() => {
                  console.log(`New base with ID ${b.id} inserted`);
                })
                .catch((error: any) => {
                  console.error("Error adding document: ", error);
                });
            });
            this.bases = bases;
          } else {
            this.bases = qs.docs.map((qd: QueryDocumentSnapshot) => ({
              id: qd.id,
              name: qd.data().name,
              color: qd.data().color,
            })) as BaseBeverageType[];
          }
          this.currentBase = this.bases[0];
          console.log("getting bases: ", this.bases);
        })
        .catch((error: any) => {
          console.error("Error getting documents:", error);
        });
      const syrupCollection = collection(db, "syrups");
      getDocs(syrupCollection)
        .then((qs: QuerySnapshot) => {
          if (qs.empty) {
            syrups.forEach((b) => {
              const syrup = doc(db, `syrups/${b.id}`);
              setDoc(syrup, { name: b.name, color: b.color })
                .then(() => {
                  console.log(`New syrup with ID ${b.id} inserted`);
                })
                .catch((error: any) => {
                  console.error("Error adding document: ", error);
                });
            });
            this.syrups = syrups;
          } else {
            this.syrups = qs.docs.map((qd: QueryDocumentSnapshot) => ({
              id: qd.id,
              name: qd.data().name,
              color: qd.data().color,
            })) as SyrupType[];
            console.log("getting syrups: ", this.syrups);
          }
          this.currentSyrup = this.syrups[0];
        })
        .catch((error: any) => {
          console.error("Error getting syrups:", error);
        });

      const creamerCollection = collection(db, "creamers");
      getDocs(creamerCollection)
        .then((qs: QuerySnapshot) => {
          if (qs.empty) {
            creamers.forEach((b) => {
              const creamer = doc(db, `creamers/${b.id}`);
              setDoc(creamer, { name: b.name, color: b.color })
                .then(() => {
                  console.log(`New creamer with ID ${b.id} inserted`);
                })
                .catch((error: any) => {
                  console.error("Error adding document: ", error);
                });
            });
            this.creamers = creamers;
          } else {
            this.creamers = qs.docs.map((qd: QueryDocumentSnapshot) => ({
              id: qd.id,
              name: qd.data().name,
              color: qd.data().color,
            })) as CreamerType[];

            console.log("getting creamers: ", this.creamers);
          }
          this.currentCreamer = this.creamers[0];
        })
        .catch((error: any) => {
          console.error("Error getting creamers:", error);
        });
    },

    showBeverage() {
      if (!this.currentBeverage) return;
      this.currentName = this.currentBeverage.name;
      this.currentTemp = this.currentBeverage.temp;
      this.currentBase = this.currentBeverage.base;
      this.currentSyrup = this.currentBeverage.syrup;
      this.currentCreamer = this.currentBeverage.creamer;
      console.log(
        `currentBeverage changed`,
        this.currentBase,
        this.currentCreamer,
        this.currentSyrup
      );
    },
    async makeBeverage() {
      if (this.user == null){
        return "No user logged in, please sign in first."
      }
      else {
        if (this.currentName == null ||
            this.currentBase == null ||
            this.currentSyrup == null ||
            this.currentCreamer == null ||
            this.currentTemp == null
            ) {
              return "Please complete all beverage options and name before making a beverage."
            }
        else {
          const newBeverage = {
            name: this.currentName,
            base: this.currentBase,
            syrup: this.currentSyrup,
            creamer: this.currentCreamer,
            temp: this.currentTemp,
            uid: this.user.uid
          };

          try {
            const docRef = await addDoc(collection(db, "beverages"), newBeverage);
            console.log("Beverage stored with ID:", docRef.id);
            this.currentBeverage = this.beverages[-1];
            return "Beverage " + this.currentName + " made successfully!"
          } catch (e) {
            console.error("Error adding beverage:", e);
            return "Error adding beverage."
          }
        }
      }
    },
    setUser(user: User | null) {
      this.user = user
      const bevs = collection(db, "beverages")
      const userBevs = [] as BeverageType[] 
      getDocs(bevs)
        .then((qs: QuerySnapshot) => {
            qs.forEach((doc) => {
              const beverageData = { id: doc.id, ...doc.data() } as BeverageType
              const match = doc.data().uid == user?.uid
              if (match) {
                userBevs.push(beverageData)
              }
            })
            this.beverages = userBevs
            this.currentBeverage = userBevs[0]
        })
        .catch((error: any) => {
          console.error("Error getting user beverages:", error);
        });
    },
    listenToBeverages() {
      const beveragesRef = collection(db, "beverages");

      // Set up real-time listener
      onSnapshot(beveragesRef, (qs) => {
        const userBevs = [] as BeverageType[] 
        qs.forEach((doc) => {
          const beverageData = { id: doc.id, ...doc.data() } as BeverageType
          const match = doc.data().uid == this.user?.uid
          if (match) {
            userBevs.push(beverageData)
          }
        })
        this.beverages = userBevs
        this.currentBeverage = userBevs[0]

        console.log("Realtime beverages:", this.beverages);
      });
    }
  },
});
