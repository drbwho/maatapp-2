import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { ViewChild } from '@angular/core';
import { ElementRef } from '@angular/core';
import { Directory } from '@capacitor/filesystem';
import { Filesystem } from '@capacitor/filesystem';

@Component({
  selector: 'app-file-explorer',
  templateUrl: './file-explorer.page.html',
  styleUrls: ['./file-explorer.page.scss'],
})
export class FileExplorerPage implements OnInit {
  folderContent = [];
	currentFolder = '';
	copyFile = null;
	@ViewChild('filepicker') uploader: ElementRef;

  constructor(
    private route: ActivatedRoute,
		private alertCtrl: AlertController,
		private router: Router,
		private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    this.currentFolder = this.route.snapshot.paramMap.get('folder') || '';
    Filesystem.requestPermissions().then(res=>{
      console.log(res);
      if(res.publicStorage === "granted"){
        this.loadDocuments();
      }
    });
  }

  async loadDocuments() {
		const folderContent = await Filesystem.readdir({
			directory: Directory.Data,
			path: this.currentFolder
		});

		this.folderContent = folderContent.files.map((file: any) => {
			return {
				name: file.name,
        type: file.type,
        uri: file.uri,
				isFile: (file.type==="file"?true:false)
			};
		});
	}

  async fileSelected($event) {}

  async itemClicked(entry) {
    if (this.copyFile) {
      // TODO
    } else {
      // Open the file or folder
      if (entry.isFile) {
        this.openFile(entry);
      } else {
        let pathToOpen =
          this.currentFolder != '' ? this.currentFolder + '/' + entry.name : entry.name;
        let folder = encodeURIComponent(pathToOpen);
        this.router.navigateByUrl(`/home/${folder}`);
      }
    }
  }

	async openFile(entry) {}
	b64toBlob = (b64Data, contentType = '', sliceSize = 512) => {};

}
