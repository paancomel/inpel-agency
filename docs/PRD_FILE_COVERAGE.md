# Liputan Fail Audit PRD

**Tarikh:** 29 Julai 2026  
**Root:** `C:\\Users\\User\\Documents\\Agency Web`  
**Fail unik dalam manifest:** 345 (344 fail baseline + PRD utama)

Dokumen ini membuktikan skop fail yang digunakan untuk menghasilkan `docs/PRD_CURRENT_PLATFORM.md`. SHA-256 diambil untuk membaca setiap fail sebagai byte stream. Untuk fail source/text, kandungan dan struktur diperiksa. Untuk output generated, bukti browser dan binari, source asal, metadata, hash dan/atau pemeriksaan visual digunakan. Nilai credential dalam fail environment sengaja tidak diterbitkan.

## Ringkasan kategori

| Kategori | Bilangan |
|---|---:|
| Aset/binari | 17 |
| Bukti QA/log | 45 |
| CI workflow | 2 |
| Dokumentasi/blueprint | 18 |
| Environment (nilai dirahsiakan) | 6 |
| Generated build | 54 |
| Konfigurasi/metadata | 45 |
| Migration DB | 13 |
| Rollback DB | 7 |
| Source/kontrak | 98 |
| Ujian | 40 |

## Pengecualian yang direkod

Dependency pihak ketiga, cache dan sejarah dalaman tidak digunakan sebagai requirement produk: `node_modules`, `.pnpm-store`, `.turbo`, dan object dalaman `.git`. Manifest/package lock, Git status dan recent commit history tetap diperiksa untuk dependency dan keadaan workspace.

## Inventori penuh

| # | Fail | Kategori | Byte | SHA-256 | Kaedah |
|---:|---|---|---:|---|---|
| 1 | `_blueprints\1-Supabase-Schema.md` | Dokumentasi/blueprint | 7012 | `4e1342ffd12e834d5da8a5a54468606dea0d41c9a82522768e39654db147c785` | Kandungan/struktur diperiksa |
| 2 | `_blueprints\2-blueprint-inpel.md` | Dokumentasi/blueprint | 5941 | `1639353dcee1d0debc8f13e34228b7c225287dd7ffb703ee490afac0f5656b0e` | Kandungan/struktur diperiksa |
| 3 | `_blueprints\3-blueprint-inpeler.md` | Dokumentasi/blueprint | 3355 | `36fd96b77fcc3645e4896efc0db8020742d8c1d085297158eafc10b8b42b93a1` | Kandungan/struktur diperiksa |
| 4 | `_blueprints\4-blueprint-inpolor.md` | Dokumentasi/blueprint | 3658 | `5e33d01c815c985316d51df6506b6bda41ddb8db1f186acef3fbf1c579b38ca8` | Kandungan/struktur diperiksa |
| 5 | `.env` | Environment (nilai dirahsiakan) | 380 | `f718ea9c6ec4588d134f5a893c5ced21d0a7487e1769a70a1e03bc3c3d9d7f79` | Nama key diperiksa; nilai tidak disalin |
| 6 | `.github\workflows\local-quality.yml` | CI workflow | 1146 | `cc00a8e0c46a43ddd6d6fe1774c5a91bb6e7c048ab2dccdc0d281a9987bcb202` | Kandungan/struktur diperiksa |
| 7 | `.github\workflows\staging-integration-audit.yml` | CI workflow | 1112 | `2e65f46b94113b5c4a80e2b308ed225317b8e3baf49a79e823f6c0b6c4e479bc` | Kandungan/struktur diperiksa |
| 8 | `.gitignore` | Konfigurasi/metadata | 84 | `1ce4c286cff9e198ff02e1db96c329c501a6df6dfa2aa608d751419591a6cdcb` | Kandungan/struktur diperiksa |
| 9 | `.playwright-cli\console-2026-07-17T09-01-38-748Z.log` | Bukti QA/log | 125 | `5a2b22fb0d5f2e3f94f5ec69d3d3c4674c3a65bd086e830c3fe004fa08bf94ec` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 10 | `.playwright-cli\console-2026-07-17T09-09-16-573Z.log` | Bukti QA/log | 365 | `faed1656ceeb9a8376d522be229d04307d548a33411ebd8a2fc2254dc7a3db84` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 11 | `.playwright-cli\console-2026-07-17T09-09-54-448Z.log` | Bukti QA/log | 227 | `5e5c852498a6a3e68375cee7de0818597d75fec5e57b43f360ea3e4b19ef63c2` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 12 | `.playwright-cli\console-2026-07-17T09-10-07-062Z.log` | Bukti QA/log | 341 | `1306a0c3d59b1521c26ff6005c148343d16e7201e94e9a24f423bf91c155bb96` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 13 | `.playwright-cli\console-2026-07-17T09-11-35-580Z.log` | Bukti QA/log | 227 | `d9d6dc3e7193c2f8cbbe764ad1f1f378ec230a440345026073d6f788293f02e4` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 14 | `.playwright-cli\console-2026-07-17T09-12-00-419Z.log` | Bukti QA/log | 227 | `0bd73152ad2f52664d76fb5c7b411cdb614e8a4f59c829dee5c30f03e083c7fd` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 15 | `.playwright-cli\console-2026-07-17T09-12-13-860Z.log` | Bukti QA/log | 341 | `243411fb563c26e397786b19897f8117edc9e970164d6db8805f8ae5c49f2c10` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 16 | `.playwright-cli\console-2026-07-17T09-13-17-523Z.log` | Bukti QA/log | 227 | `fdcebb6e5775a02d65d158fc6170c440de0c7ad7e2daa27b0a7500a01891b034` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 17 | `.playwright-cli\console-2026-07-17T09-13-57-822Z.log` | Bukti QA/log | 227 | `166480845c92297d6d4a88819fc19a5e623134a2ed1b197a74fc14b86689a96c` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 18 | `.playwright-cli\console-2026-07-17T09-14-09-427Z.log` | Bukti QA/log | 341 | `cd10c17770e9d0c65908bb93dd5e28219b669f449f24c4a52a570a8daf0db596` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 19 | `.playwright-cli\console-2026-07-17T09-15-42-478Z.log` | Bukti QA/log | 365 | `11c9e8a21d13f346c430f4ca75eb49021e9940b722bb09ad90c51614113969df` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 20 | `.playwright-cli\console-2026-07-17T09-16-01-031Z.log` | Bukti QA/log | 227 | `ffc1eb57edad10d50930b6d3efedeb4a56db94973815125ae28bdf19d41568e2` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 21 | `.playwright-cli\console-2026-07-17T09-16-18-781Z.log` | Bukti QA/log | 227 | `67415c41c08d842fb9b6c362e7da2334c4cb925f28ce86d37b9f05fc6b2e91e9` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 22 | `.playwright-cli\console-2026-07-17T09-16-37-760Z.log` | Bukti QA/log | 227 | `f4bdb94a48fe58816e272ce244bb3352ec0f6bbd2c377b91b403766b6413abb7` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 23 | `.playwright-cli\console-2026-07-17T09-16-55-298Z.log` | Bukti QA/log | 227 | `f639166d1f240b75e2b194bbd6cc5d6942b72dc6fa7b037069d720cd2ad6c0d2` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 24 | `.playwright-cli\console-2026-07-17T09-17-14-263Z.log` | Bukti QA/log | 227 | `817f102642dfee24d2d1fa240759742ee3926dabddef47a3258722572b0a239d` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 25 | `.playwright-cli\page-2026-07-17T09-09-18-488Z.yml` | Bukti QA/log | 9527 | `131154ed14c86f9507c87874db2a9749a29916a0b1c9c61afe3a7a4be7aa291a` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 26 | `.playwright-cli\page-2026-07-17T09-09-55-072Z.yml` | Bukti QA/log | 2166 | `77bdd6e1666e95a3fc8c0e6e215cb9ebd442c88faad5dcd7a1f0adc3609895dc` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 27 | `.playwright-cli\page-2026-07-17T09-10-07-423Z.yml` | Bukti QA/log | 9807 | `eb59bb800e9563265366523a91d5bcdcb29ffae9e2315c964ad5b7644edf1cbd` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 28 | `.playwright-cli\page-2026-07-17T09-10-15-686Z.yml` | Bukti QA/log | 10384 | `b433b612dc09e37bf3cd604fd2cb497f1c85e537f18397d10c13802e94df9be2` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 29 | `.playwright-cli\page-2026-07-17T09-10-30-063Z.yml` | Bukti QA/log | 10319 | `2bfe10c601af0bd741dbd6c4604c5f9cce855638a78f8484e60e0b2d36dead45` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 30 | `.playwright-cli\page-2026-07-17T09-10-36-232Z.yml` | Bukti QA/log | 10238 | `a5cb65d521224c1fd796cb3c9899bf87726a11b9a4ca69621f08401f10c2470e` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 31 | `.playwright-cli\page-2026-07-17T09-10-44-256Z.yml` | Bukti QA/log | 10160 | `892abdc91f19e29319105b54a850986d2bf9f651ad9be3f75e4358401d98560b` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 32 | `.playwright-cli\page-2026-07-17T09-10-51-109Z.yml` | Bukti QA/log | 10082 | `303bdf3664c7ad3bfd6ed9c1f16809fec73601b900867ceaf61618aa4c6c18fd` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 33 | `.playwright-cli\page-2026-07-17T09-10-58-307Z.yml` | Bukti QA/log | 10004 | `6d53669f0b164b711343aebcc654832be961ed3434fe000ff05e62fcc0b26acf` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 34 | `.playwright-cli\page-2026-07-17T09-11-04-328Z.yml` | Bukti QA/log | 9926 | `74ae525e12d030da88b718201f7b0e479707d05837c5773d3721a2976612a217` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 35 | `.playwright-cli\page-2026-07-17T09-11-12-399Z.yml` | Bukti QA/log | 9926 | `36cd4369a1d64abbfca2d0567fb0df79ee1d9e6590058e0f7e1b0093736aaac1` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 36 | `.playwright-cli\page-2026-07-17T09-11-37-492Z.yml` | Bukti QA/log | 667 | `dbe8a7244019cb7cd790483e7886369fa3a2c59e6fa33e3518f4c615c5f84f2d` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 37 | `.playwright-cli\page-2026-07-17T09-12-01-106Z.yml` | Bukti QA/log | 687 | `bd121bbbd0243cc487a03020380376f1ad6473963760f238183473603628a9bf` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 38 | `.playwright-cli\page-2026-07-17T09-12-14-148Z.yml` | Bukti QA/log | 687 | `2361704b155160a91ad0d57b1a4279f6e004b187db679d1271696646ae88e98c` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 39 | `.playwright-cli\page-2026-07-17T09-12-20-555Z.yml` | Bukti QA/log | 7136 | `4f25d0eb363bdff7c26339331637de5e443092a372bc9e878f2ef73e14f47400` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 40 | `.playwright-cli\page-2026-07-17T09-13-19-563Z.yml` | Bukti QA/log | 8610 | `f5d498593338a9cc1cd40d37fd53c7c0cdcc47f452d9c649789ad5054a082c82` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 41 | `.playwright-cli\page-2026-07-17T09-13-58-176Z.yml` | Bukti QA/log | 530 | `c0953d9b78f13ac4eb2fe32097ed052073d95e4b464a66fe39f0b46c90778318` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 42 | `.playwright-cli\page-2026-07-17T09-14-09-764Z.yml` | Bukti QA/log | 8922 | `7527797b597d16e38f1f29c10e4849e468df934afd986f6e76ab10bcdb89bc91` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 43 | `.playwright-cli\page-2026-07-17T09-15-44-065Z.yml` | Bukti QA/log | 9527 | `131154ed14c86f9507c87874db2a9749a29916a0b1c9c61afe3a7a4be7aa291a` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 44 | `.playwright-cli\page-2026-07-17T09-16-01-385Z.yml` | Bukti QA/log | 2166 | `77bdd6e1666e95a3fc8c0e6e215cb9ebd442c88faad5dcd7a1f0adc3609895dc` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 45 | `.playwright-cli\page-2026-07-17T09-16-20-315Z.yml` | Bukti QA/log | 550 | `6bfb6da2114cd215e852023e55bab047d3eba8613b67fa65d7f382e9ddbc35d5` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 46 | `.playwright-cli\page-2026-07-17T09-16-38-332Z.yml` | Bukti QA/log | 687 | `bd121bbbd0243cc487a03020380376f1ad6473963760f238183473603628a9bf` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 47 | `.playwright-cli\page-2026-07-17T09-16-56-967Z.yml` | Bukti QA/log | 8610 | `f5d498593338a9cc1cd40d37fd53c7c0cdcc47f452d9c649789ad5054a082c82` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 48 | `.playwright-cli\page-2026-07-17T09-17-14-744Z.yml` | Bukti QA/log | 9942 | `3ae138041a2e309fd3da596a65f12ae43bca2cb60702172414f6dda7ddfc3160` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 49 | `.playwright-cli\page-2026-07-18T05-06-58-190Z.yml` | Bukti QA/log | 634 | `23928825b0a23a3e96501e043c4721428f0a12793081504c4e6127ae44319ed7` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 50 | `.playwright-cli\page-2026-07-18T05-09-18-364Z.yml` | Bukti QA/log | 634 | `23928825b0a23a3e96501e043c4721428f0a12793081504c4e6127ae44319ed7` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 51 | `.playwright-cli\page-2026-07-18T05-12-18-318Z.yml` | Bukti QA/log | 630 | `de1d6f2b484fd3bc489a186a0386cf14afad1c91504a234e2c6eb4e27f7c585d` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 52 | `apps\portal-parent\.env.example` | Environment (nilai dirahsiakan) | 109 | `188cb4642c5af4ba9059b3ef20abb842be3b71520b0530fa9db6c0a8aaa8db4d` | Nama key diperiksa; nilai tidak disalin |
| 53 | `apps\portal-parent\dist\assets\dist-DXedqlih.js` | Generated build | 204102 | `74a7071c10da520051a82e9f117051b6e668b4e3205f5a5c843495cc0a81055c` | Generated; struktur/hash diambil, source asal diutamakan |
| 54 | `apps\portal-parent\dist\assets\index-D98SqpLh.css` | Generated build | 32159 | `86e5e4c4664cd3332fd39ef25847645db873a7496d9fb3ed4e8474d263798a56` | Generated; struktur/hash diambil, source asal diutamakan |
| 55 | `apps\portal-parent\dist\assets\index-mjTLIC8j.js` | Generated build | 326634 | `6ac98ba189ff9ede3741acfdc6be98bb54944abb02e42179d27fc270e3dfb34a` | Generated; struktur/hash diambil, source asal diutamakan |
| 56 | `apps\portal-parent\dist\index.html` | Generated build | 876 | `469b44e173c1ee6d84fdcb285b582206cc314dc5db1cc6198d52f55b8ad1b2aa` | Generated; struktur/hash diambil, source asal diutamakan |
| 57 | `apps\portal-parent\eslint.config.js` | Source/kontrak | 803 | `b42203b1bb35f0614e89c41cda9a68bb007030196918c363f2e898d81a828ad9` | Kandungan/struktur diperiksa |
| 58 | `apps\portal-parent\index.html` | Konfigurasi/metadata | 778 | `d009f13131d495b4a12de598812450d4db036c40c24f3f11efbb0a67028eacc0` | Kandungan/struktur diperiksa |
| 59 | `apps\portal-parent\package.json` | Konfigurasi/metadata | 1292 | `5a96f4f51ecd910f4479f78b41262164a5ab06dab739cc681901d4f3a1f12bd1` | Kandungan/struktur diperiksa |
| 60 | `apps\portal-parent\README.md` | Dokumentasi/blueprint | 2034 | `fe87a83f4f268b23ad807d456a0eadf7cef7b1ea9b146e3fa1873f1dcdafbf0e` | Kandungan/struktur diperiksa |
| 61 | `apps\portal-parent\src\app\App.test.tsx` | Ujian | 5701 | `143a7c5ef9dbd7b27de2ed1606e47134a70e6dfffc169f75b517c8330f8465c7` | Kandungan/struktur diperiksa |
| 62 | `apps\portal-parent\src\app\App.tsx` | Source/kontrak | 5770 | `4f9614ac961e8486b8521da00b9e50f2496d0c8288c7e9900c09922eee08933e` | Kandungan/struktur diperiksa |
| 63 | `apps\portal-parent\src\components\AuthModal.tsx` | Source/kontrak | 2815 | `d0dc81f3434b7b879df03282e9a7ee2da9efa9060bc20aebf46913d90d1dcb87` | Kandungan/struktur diperiksa |
| 64 | `apps\portal-parent\src\components\FilterBar.tsx` | Source/kontrak | 2172 | `0c2bc5b5e904fdab8dcd6577847f7618e084a5591cc7dd67d5a045067b470a50` | Kandungan/struktur diperiksa |
| 65 | `apps\portal-parent\src\components\ModalShell.tsx` | Source/kontrak | 1760 | `3bbf8f05a45e3e63b7058ee95beb4af2ce0b4a5ac0fd669306b7443c9b222882` | Kandungan/struktur diperiksa |
| 66 | `apps\portal-parent\src\components\Navbar.tsx` | Source/kontrak | 1526 | `c0b6fd4babb68873ee5db7422d75e71d903503d9fb2ba7e140bcbfcfd5cd3b9a` | Kandungan/struktur diperiksa |
| 67 | `apps\portal-parent\src\components\QuickReviewModal.tsx` | Source/kontrak | 3390 | `d36ca64ab5fdb4d28d50fc7827dfbec71c933859d9a0afe2b179fbe983418f9b` | Kandungan/struktur diperiksa |
| 68 | `apps\portal-parent\src\components\ReviewCard.test.tsx` | Ujian | 998 | `539c25f0dcd5a8942d4ff8790933a591ecc5033d6d582728c242b097590a71a4` | Kandungan/struktur diperiksa |
| 69 | `apps\portal-parent\src\components\ReviewCard.tsx` | Source/kontrak | 5236 | `5c714801a64d0576a75fe2778749c744f6d47e2a48adfb667a965a1ac92bb3a6` | Kandungan/struktur diperiksa |
| 70 | `apps\portal-parent\src\components\ReviewFeed.tsx` | Source/kontrak | 2411 | `4ae8f76ef8139aebc7059ab00c56e1b6f306c050249ccfa988134ed319a536e6` | Kandungan/struktur diperiksa |
| 71 | `apps\portal-parent\src\components\ReviewTabs.tsx` | Source/kontrak | 1142 | `510d18ae2ca24c82a2299eab3232e19fc5acb3caea614e298ce061cd386b48ed` | Kandungan/struktur diperiksa |
| 72 | `apps\portal-parent\src\components\ReviewWizard.tsx` | Source/kontrak | 11573 | `5710137505f77bf031d22d9e9d1a4cbaa8335f7e154f63e650c87ea8058bae4b` | Kandungan/struktur diperiksa |
| 73 | `apps\portal-parent\src\components\Sidebar.tsx` | Source/kontrak | 1783 | `92534893545c68974bb2669aa9ea39d04723776b1b8701df86460820e9479705` | Kandungan/struktur diperiksa |
| 74 | `apps\portal-parent\src\components\StarRating.tsx` | Source/kontrak | 687 | `82e4184c24eb96277169c0754b92352e07cb0c2f532b887a2f226cbc98b3fa36` | Kandungan/struktur diperiksa |
| 75 | `apps\portal-parent\src\components\UniversityHeader.tsx` | Source/kontrak | 1915 | `9aae864a63ab16d29206f34d6fa6598f0e5f068e1ef30ae72b753d19b8304d73` | Kandungan/struktur diperiksa |
| 76 | `apps\portal-parent\src\lib\review-data.test.ts` | Ujian | 1684 | `6e347d84e73851675bcaf7214c348c82dbcb08af8941355f0f5baa1591d734e3` | Kandungan/struktur diperiksa |
| 77 | `apps\portal-parent\src\lib\review-data.ts` | Source/kontrak | 7427 | `95a317f91a52b0725caf9f8fd71bcbbd902bb04fa05574685bc0dfd5d85dea2a` | Kandungan/struktur diperiksa |
| 78 | `apps\portal-parent\src\lib\seed-data.ts` | Source/kontrak | 2073 | `2715167b9094235534754e423ba89857a68c2fa3bedc4dc9593fb97917d2426c` | Kandungan/struktur diperiksa |
| 79 | `apps\portal-parent\src\lib\storage.test.ts` | Ujian | 1289 | `cfe2cca2804a9f5cd302478236f34f9b253aaf32b71045ec0f9609fd028101d0` | Kandungan/struktur diperiksa |
| 80 | `apps\portal-parent\src\lib\storage.ts` | Source/kontrak | 2009 | `ff142f0bd1b75628337efdd35a37278dafd09ee498ca021d6b00c18e8d49cc51` | Kandungan/struktur diperiksa |
| 81 | `apps\portal-parent\src\lib\types.ts` | Source/kontrak | 1256 | `9eb93192c7f4a5dd0f1ef3eb6a0e728b81129cc404dc4b94933cab5ec29a7615` | Kandungan/struktur diperiksa |
| 82 | `apps\portal-parent\src\lib\validation.test.ts` | Ujian | 1397 | `6e63094f4426dce887b1792fc1dd6c12c08a2ed250ec9c346202451a4c2c9224` | Kandungan/struktur diperiksa |
| 83 | `apps\portal-parent\src\lib\validation.ts` | Source/kontrak | 1084 | `4b17a034998600107406971166c936d8786b16848c59297e3eb50343bdba69e4` | Kandungan/struktur diperiksa |
| 84 | `apps\portal-parent\src\main.tsx` | Source/kontrak | 329 | `96a85f78738e07c6d416e9a24cbd60a517643f347838f197a298a2f2935e7328` | Kandungan/struktur diperiksa |
| 85 | `apps\portal-parent\src\routes\HomePage.tsx` | Source/kontrak | 1653 | `379b18d73f947a7f74ddee35a351ecb73602324548b77bc43a712db615f02329` | Kandungan/struktur diperiksa |
| 86 | `apps\portal-parent\src\styles.css` | Source/kontrak | 2244 | `259de8e07804c1aa1dd30186e52fe48bebbf519e951de66b72193412089fc1fa` | Kandungan/struktur diperiksa |
| 87 | `apps\portal-parent\src\test\setup.ts` | Source/kontrak | 114 | `8e39c6c21f85397207203b02eb06ba444dafc2570fa1390d5a126c19a09d662b` | Kandungan/struktur diperiksa |
| 88 | `apps\portal-parent\tsconfig.app.json` | Konfigurasi/metadata | 293 | `03d7cbba3aa73d90570f18c3d91f2bf048434ada69cce2f047173ae49c0ddd0a` | Kandungan/struktur diperiksa |
| 89 | `apps\portal-parent\tsconfig.app.tsbuildinfo` | Generated build | 84365 | `9deb5e19bda98e7ebfcdc0858495839d668e34a898693d6552cfe866f666dee5` | Generated; struktur/hash diambil, source asal diutamakan |
| 90 | `apps\portal-parent\tsconfig.json` | Konfigurasi/metadata | 119 | `770b4140bbb581e2dfd9ea9946ffc9c75a1d86ba7d2db5f77c83e37cbdf9d808` | Kandungan/struktur diperiksa |
| 91 | `apps\portal-parent\tsconfig.node.json` | Konfigurasi/metadata | 229 | `11f3a584f509197f004bdd4700172443f10e64f3bf89f459b139170d839629ef` | Kandungan/struktur diperiksa |
| 92 | `apps\portal-parent\tsconfig.node.tsbuildinfo` | Generated build | 57894 | `1842bda6b99be86d2d668568a36c4563659d53707525d7357dfed3ebf58b6de4` | Generated; struktur/hash diambil, source asal diutamakan |
| 93 | `apps\portal-parent\vite.config.ts` | Source/kontrak | 973 | `94284d30000e8fdd7f71ff2ce5d3b1d5771849768dfec85f05c4cf4cd628589b` | Kandungan/struktur diperiksa |
| 94 | `apps\portal-student\.env.example` | Environment (nilai dirahsiakan) | 109 | `188cb4642c5af4ba9059b3ef20abb842be3b71520b0530fa9db6c0a8aaa8db4d` | Nama key diperiksa; nilai tidak disalin |
| 95 | `apps\portal-student\dist\assets\dist-D4aeXTUc.js` | Generated build | 205364 | `b9f8559bb71281f7a89380b6ba0f8fa7546bb65683ede688f92b1b9f7bf44977` | Generated; struktur/hash diambil, source asal diutamakan |
| 96 | `apps\portal-student\dist\assets\index-CbTi_M-Z.css` | Generated build | 29688 | `aa50e5da28d7ee89a03b59b61b9e771b7f1b4ff8f98da190881e8cbe267364db` | Generated; struktur/hash diambil, source asal diutamakan |
| 97 | `apps\portal-student\dist\assets\index-uvAECfn9.js` | Generated build | 341063 | `1d7a756ec7a792ae028edb615b6eeec21aa0ee6423d61adc8ba8c4de04d7eee7` | Generated; struktur/hash diambil, source asal diutamakan |
| 98 | `apps\portal-student\dist\favicon.svg` | Generated build | 189 | `48334fa68f34aed79d944354fd77059876c70842291d494397a0d3a80ea77c47` | Generated; struktur/hash diambil, source asal diutamakan |
| 99 | `apps\portal-student\dist\index.html` | Generated build | 560 | `00d89e859aea294a3ece04291446e924c2c03a09f09dfe3cac5b17ea2f021f5a` | Generated; struktur/hash diambil, source asal diutamakan |
| 100 | `apps\portal-student\eslint.config.js` | Source/kontrak | 824 | `415a347aa704bda16bd4c9dab070acccc1ddb82b8e2711c4ada140a4524f785b` | Kandungan/struktur diperiksa |
| 101 | `apps\portal-student\index.html` | Konfigurasi/metadata | 462 | `845616f4de0786d2c64dbce534c251c825900d9f5731ced07e10885876a37132` | Kandungan/struktur diperiksa |
| 102 | `apps\portal-student\package.json` | Konfigurasi/metadata | 1293 | `cdbb877a0b0d8c26cf00f86cf34344bb2aa58a8469c4ab8b65fff45e079d28fb` | Kandungan/struktur diperiksa |
| 103 | `apps\portal-student\public\favicon.svg` | Aset/binari | 189 | `48334fa68f34aed79d944354fd77059876c70842291d494397a0d3a80ea77c47` | Kandungan/struktur diperiksa |
| 104 | `apps\portal-student\README.md` | Dokumentasi/blueprint | 4295 | `9a8501f265e2342f22510f3e73f85ee641b14dbb965352f3026cd1ea0ab5c194` | Kandungan/struktur diperiksa |
| 105 | `apps\portal-student\src\app\App.test.tsx` | Ujian | 3174 | `d3898aa08811877769a5d537ed18f26cdda4679b8772fedd4c9189524cfe51dd` | Kandungan/struktur diperiksa |
| 106 | `apps\portal-student\src\app\App.tsx` | Source/kontrak | 2601 | `ea173248084a88242077b6dc1b3dba5d830e5cc0c36e06d652eaa5a5cf271d98` | Kandungan/struktur diperiksa |
| 107 | `apps\portal-student\src\components\CourseFormFields.tsx` | Source/kontrak | 2603 | `adefaadfde12cf40c0ffdb26e3aa4c83918ec4bfda156c8dc8f6b64e5b330419` | Kandungan/struktur diperiksa |
| 108 | `apps\portal-student\src\components\DashboardLayout.tsx` | Source/kontrak | 4337 | `a54eb09c40937de6a16f2b169bc5e483918be49cc6772e67cc7766290ee612c1` | Kandungan/struktur diperiksa |
| 109 | `apps\portal-student\src\components\LoginView.tsx` | Source/kontrak | 5958 | `9b99dcdf776abf57cf6481640de90d8cb0a75e17d40c92cd40a4bba84a195205` | Kandungan/struktur diperiksa |
| 110 | `apps\portal-student\src\components\SecureImageUpload.tsx` | Source/kontrak | 2929 | `16c5c2cef82178bcc6301363d7bcb57dee487f24cfb57d69eaea8da2282340a4` | Kandungan/struktur diperiksa |
| 111 | `apps\portal-student\src\components\ToastNotification.tsx` | Source/kontrak | 1100 | `e89204ad0d5bd7e63064f476e9355d9fdf72c28292e4355b3a945598b0c584ac` | Kandungan/struktur diperiksa |
| 112 | `apps\portal-student\src\lib\assets.test.ts` | Ujian | 1780 | `e6cbf13622f86f8c8f487f20481dee8e311c148ee5490debad5089c2c5fe4366` | Kandungan/struktur diperiksa |
| 113 | `apps\portal-student\src\lib\assets.ts` | Source/kontrak | 2769 | `60751906f05fe47894c5eecce3d501995169c534b1d8e8cb53d35642e6c5df61` | Kandungan/struktur diperiksa |
| 114 | `apps\portal-student\src\lib\database-publish.test.ts` | Ujian | 6269 | `fd92abbb91ace390d6e62725184fc4e6c2e0c875a61b869eb61cf9227d242b7e` | Kandungan/struktur diperiksa |
| 115 | `apps\portal-student\src\lib\database.test.ts` | Ujian | 3446 | `87fa48638d9302d315d2ba1d81bea2e520973950ccd1fe3f8997521be4b17975` | Kandungan/struktur diperiksa |
| 116 | `apps\portal-student\src\lib\database.ts` | Source/kontrak | 10635 | `9143da1cce1a52d2a1468c3a94d66afef968f0bdf2f8a5a60f9d51175448f96a` | Kandungan/struktur diperiksa |
| 117 | `apps\portal-student\src\lib\defaults.ts` | Source/kontrak | 1417 | `c58bdefa5a027b3a73a964958ad51868afc9f87cf2be02e0c53d8cfec1e0ba09` | Kandungan/struktur diperiksa |
| 118 | `apps\portal-student\src\lib\runtime.test.ts` | Ujian | 325 | `a215102f239cec4199360606168f236449f533e51422ade80b8565014dc4f661` | Kandungan/struktur diperiksa |
| 119 | `apps\portal-student\src\lib\runtime.ts` | Source/kontrak | 276 | `f19fd4bbaa981723e72b90808c1545860c4818473c92921705b0436c24bea784` | Kandungan/struktur diperiksa |
| 120 | `apps\portal-student\src\lib\storage.test.ts` | Ujian | 1179 | `f17c19b2bdf6da0585959e88658e6437cff34dc8cdfa6b51d64fb1ec9d2025da` | Kandungan/struktur diperiksa |
| 121 | `apps\portal-student\src\lib\storage.ts` | Source/kontrak | 790 | `d7d0f198bf0fe8e69bdfa2679f2fd905913ccf131cb0c06f2b04085f761cc60a` | Kandungan/struktur diperiksa |
| 122 | `apps\portal-student\src\lib\validation.test.ts` | Ujian | 3134 | `0154425cfa267b86181d1bc103e57f613d2bb0a8116f91198ab702700fdc4693` | Kandungan/struktur diperiksa |
| 123 | `apps\portal-student\src\lib\validation.ts` | Source/kontrak | 4905 | `dc51d592f51f457e3f1a601f07e8342d11a33b7ea29866da78dcb09a6033f22c` | Kandungan/struktur diperiksa |
| 124 | `apps\portal-student\src\main.tsx` | Source/kontrak | 335 | `de09d67248bb14672e1c7543f711ff9ddd88a2730c4138bb11ebdca81c752ac0` | Kandungan/struktur diperiksa |
| 125 | `apps\portal-student\src\routes\CourseFormPage.test.tsx` | Ujian | 3131 | `e6eb814af8dd42e6dd2eecb08b3fffc72793ef142e7569fa6855d052a398cc83` | Kandungan/struktur diperiksa |
| 126 | `apps\portal-student\src\routes\CourseFormPage.tsx` | Source/kontrak | 9599 | `1d2fcb8e70c472dbd5d95e5d8abd153a06617157fa23d677ecf31f7188b1a1b5` | Kandungan/struktur diperiksa |
| 127 | `apps\portal-student\src\routes\CoursesPage.tsx` | Source/kontrak | 2917 | `3a887b5d802ad175f589681a4073c5e77c5af13c394e8d905e3b6b526f456f89` | Kandungan/struktur diperiksa |
| 128 | `apps\portal-student\src\routes\GlobalProfilePage.test.tsx` | Ujian | 2363 | `81e862ade53a88fd57e14e05d38b0f7621e99fd2375c38d3a06084ed9e8170b3` | Kandungan/struktur diperiksa |
| 129 | `apps\portal-student\src\routes\GlobalProfilePage.tsx` | Source/kontrak | 10997 | `0bbbf1a4683c69f1c3c99101460bf5d8878acdbb529501587c97ea6325f6b798` | Kandungan/struktur diperiksa |
| 130 | `apps\portal-student\src\routes\ReviewPage.tsx` | Source/kontrak | 8873 | `4e43b18a0406659d7c6498fc74dd80e0eeff55a1607a6ac491b1b1ae7bbff8c6` | Kandungan/struktur diperiksa |
| 131 | `apps\portal-student\src\routes\SuccessPage.tsx` | Source/kontrak | 2694 | `c772f90b5862956f04b2f828838f6ccd5a7e467ebe1c106518c8f4a69197d8b1` | Kandungan/struktur diperiksa |
| 132 | `apps\portal-student\src\state\PortalContext.tsx` | Source/kontrak | 4498 | `d491785dda05be240af890415534bf9fe7db3df523a81b8d33d5a0d923900964` | Kandungan/struktur diperiksa |
| 133 | `apps\portal-student\src\state\PortalContextObject.ts` | Source/kontrak | 1133 | `db513eeec3071a7e54853f65475d5ff84bd69bec40fe149af0fa8ddb9d24995a` | Kandungan/struktur diperiksa |
| 134 | `apps\portal-student\src\state\usePortal.ts` | Source/kontrak | 327 | `ef4f318cab7070b89f9d737bf1ce3c4e6acb76cab87f50c82021549cbcbe2bab` | Kandungan/struktur diperiksa |
| 135 | `apps\portal-student\src\styles.css` | Source/kontrak | 5267 | `a0f84143f151fcab04b500d05571eeb6545f6362b15e0353249cf92dd308914f` | Kandungan/struktur diperiksa |
| 136 | `apps\portal-student\src\test\setup.ts` | Source/kontrak | 90 | `9877cb0fdb5f5521c77336835d7cdba99799f2530d0882e4b1571a6f443e7833` | Kandungan/struktur diperiksa |
| 137 | `apps\portal-student\src\types\portal.ts` | Source/kontrak | 2270 | `47fff3e9b836b9507f482c62e4b0041b8777badef73e7cd814e1f256fa3b2adf` | Kandungan/struktur diperiksa |
| 138 | `apps\portal-student\tsconfig.app.json` | Konfigurasi/metadata | 293 | `03d7cbba3aa73d90570f18c3d91f2bf048434ada69cce2f047173ae49c0ddd0a` | Kandungan/struktur diperiksa |
| 139 | `apps\portal-student\tsconfig.app.tsbuildinfo` | Generated build | 85214 | `65107b860d9a943d1007b23a71b9c6b1da1555741c19c368e52215dbf442281b` | Generated; struktur/hash diambil, source asal diutamakan |
| 140 | `apps\portal-student\tsconfig.json` | Konfigurasi/metadata | 119 | `770b4140bbb581e2dfd9ea9946ffc9c75a1d86ba7d2db5f77c83e37cbdf9d808` | Kandungan/struktur diperiksa |
| 141 | `apps\portal-student\tsconfig.node.json` | Konfigurasi/metadata | 229 | `11f3a584f509197f004bdd4700172443f10e64f3bf89f459b139170d839629ef` | Kandungan/struktur diperiksa |
| 142 | `apps\portal-student\tsconfig.node.tsbuildinfo` | Generated build | 57803 | `a0c6be7752d2f0b137e7aa03d552d57d024099a06ec35f675e48ffe0769fc464` | Generated; struktur/hash diambil, source asal diutamakan |
| 143 | `apps\portal-student\vite.config.ts` | Source/kontrak | 816 | `3c8f87d49c7f1408c72b97b7e25ba10e49912a6b816363f30f62ef0d401c7491` | Kandungan/struktur diperiksa |
| 144 | `apps\portal-student\vitest.config.mjs` | Source/kontrak | 348 | `87fb52165aaf6e1ad48911e59337ba357501a0a215d37d1b722af830ffa1d4dd` | Kandungan/struktur diperiksa |
| 145 | `apps\portal-universiti\.env.example` | Environment (nilai dirahsiakan) | 102 | `ae5b2af85643dfdc88d5b93586d5c96a39bf3d27e8aa188bb6ef645c145535a3` | Nama key diperiksa; nilai tidak disalin |
| 146 | `apps\portal-universiti\dev-server-error.log` | Bukti QA/log | 33 | `4c0f0403e0b237f284bc5ef2972870dc5e9d24ef2ce9d889328f1cc432d17709` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 147 | `apps\portal-universiti\dev-server.log` | Bukti QA/log | 6241 | `8655db7c88c36ff5b04b07072ed7951ebc9bdc04e0a8a080edba083750843214` | Diindeks sebagai bukti QA; isu/copy/route diringkaskan |
| 148 | `apps\portal-universiti\dist\assets\arrow-left-ilGhPEAD.js` | Generated build | 165 | `c4964ef93b71b784e8a23cc78ee354c456d3385dca02f80568740fdeff0a6c89` | Generated; struktur/hash diambil, source asal diutamakan |
| 149 | `apps\portal-universiti\dist\assets\arrow-right-Cex7JUIJ.js` | Generated build | 165 | `e7858ee066082255021829db7c1361dfa09cce759e3ef815aea365db205d6442` | Generated; struktur/hash diambil, source asal diutamakan |
| 150 | `apps\portal-universiti\dist\assets\auth-flow-krlf0CLg.js` | Generated build | 2229 | `77baad5a87cbcfdefc9a5f8b0bd8580184917d2d3ac835993414a0c38de4d30b` | Generated; struktur/hash diambil, source asal diutamakan |
| 151 | `apps\portal-universiti\dist\assets\AuthCallback-DwAGAgEF.js` | Generated build | 2642 | `1395cf29423a10cbcba5ac1b3a8059bc98c7b27bba70568d31dbbd201809f03a` | Generated; struktur/hash diambil, source asal diutamakan |
| 152 | `apps\portal-universiti\dist\assets\Checkout-CbiJjmaw.js` | Generated build | 3506 | `efaba02cab23883b80729bfac6a95b4db17385e6aa8c4905bd4879170da39a68` | Generated; struktur/hash diambil, source asal diutamakan |
| 153 | `apps\portal-universiti\dist\assets\circle-check-CqHG_VQe.js` | Generated build | 178 | `0e45be5b8b1a180fa46c3d4ec91ddca24abef834fa4b9fe8640bf1e680bd31d1` | Generated; struktur/hash diambil, source asal diutamakan |
| 154 | `apps\portal-universiti\dist\assets\createLucideIcon-CagTSf0I.js` | Generated build | 29366 | `d9e9405c650f8bb30e34327d3902107f67be9011be3bff3e1db9ddc13cf8fe55` | Generated; struktur/hash diambil, source asal diutamakan |
| 155 | `apps\portal-universiti\dist\assets\database-payloads-CdExXIt1.js` | Generated build | 693 | `7205ed968064635680238441523351782a2012e11149c690603e94f8e68a3e4c` | Generated; struktur/hash diambil, source asal diutamakan |
| 156 | `apps\portal-universiti\dist\assets\dist-CWyYb4ss.js` | Generated build | 204102 | `771ea96a6f4dce7142b7d81ab954bb5877f2461205708bc6032f243163e0b472` | Generated; struktur/hash diambil, source asal diutamakan |
| 157 | `apps\portal-universiti\dist\assets\EmailNotification-CLXvJTRn.js` | Generated build | 3323 | `7d9e36ff6936cc43d115a27cf4f89470302eee6f27db8d2fcbb31eaeed0eb190` | Generated; struktur/hash diambil, source asal diutamakan |
| 158 | `apps\portal-universiti\dist\assets\index-BA3QIz1x.js` | Generated build | 440516 | `4ad2d228ad2caf195f8767dea9dc1f08c3b769c7e507cf4525b20533fa6ded7e` | Generated; struktur/hash diambil, source asal diutamakan |
| 159 | `apps\portal-universiti\dist\assets\index-m3nb1dba.css` | Generated build | 35204 | `1d07e9298072aafdd98e6502ec16e979970fe98ec4209c2b09d94c2f236301e2` | Generated; struktur/hash diambil, source asal diutamakan |
| 160 | `apps\portal-universiti\dist\assets\ParentHandoff-YsSzEdzu.js` | Generated build | 2140 | `792a1ccec2a66b4d100f52c0ea7b01f2d04370c50a2cbc33d55af08241b307f2` | Generated; struktur/hash diambil, source asal diutamakan |
| 161 | `apps\portal-universiti\dist\assets\ParentSessionGate-DEgy9eYP.js` | Generated build | 1307 | `dfb6d83c7bc393a515d08d1e15196457544939b5d8c4d29a3b2f4adcd04af72a` | Generated; struktur/hash diambil, source asal diutamakan |
| 162 | `apps\portal-universiti\dist\assets\Results-CqhMKAwK.js` | Generated build | 6178 | `ad9ca2040d546c51e6baf02555e6fadbd32dcef90bba20d33eda49fd75482dd0` | Generated; struktur/hash diambil, source asal diutamakan |
| 163 | `apps\portal-universiti\dist\assets\ScholarshipGuide-CS9qc5ml.js` | Generated build | 6318 | `b1b679b382fe630d73564c45428469a9ebff17d0e8cf34d318dc092c66722e18` | Generated; struktur/hash diambil, source asal diutamakan |
| 164 | `apps\portal-universiti\dist\assets\shield-check-B0SvpoNq.js` | Generated build | 320 | `36db879e908f4b61a08bff12be2b7f94884f7e2790a4f488289720f8c759fbbb` | Generated; struktur/hash diambil, source asal diutamakan |
| 165 | `apps\portal-universiti\dist\assets\StudentPortal-DBb4iFCw.js` | Generated build | 21069 | `882af00b64d177fdc81ad35667d8f9e987fa070e0c827a30262a40090289f51b` | Generated; struktur/hash diambil, source asal diutamakan |
| 166 | `apps\portal-universiti\dist\index.html` | Generated build | 711 | `146d6da0b47feb85b31b317e6b7828a42d66396e487163aab830451eaabd532d` | Generated; struktur/hash diambil, source asal diutamakan |
| 167 | `apps\portal-universiti\eslint.config.js` | Source/kontrak | 803 | `b42203b1bb35f0614e89c41cda9a68bb007030196918c363f2e898d81a828ad9` | Kandungan/struktur diperiksa |
| 168 | `apps\portal-universiti\index.html` | Konfigurasi/metadata | 526 | `01e54f69c537f89f06e10d48b63a4bbdfd31c477ffae6e3282637424e4c2e4f3` | Kandungan/struktur diperiksa |
| 169 | `apps\portal-universiti\package.json` | Konfigurasi/metadata | 1471 | `4e6d3b0db0ca3ccbe2243b25af82a54b4eb8d7aaf636ff3895df97c7dc680d84` | Kandungan/struktur diperiksa |
| 170 | `apps\portal-universiti\README.md` | Dokumentasi/blueprint | 4520 | `abd3c6a5569d88ec74cac1b6cfb96445ec33093deb137b1575835ebdbc0d6b7f` | Kandungan/struktur diperiksa |
| 171 | `apps\portal-universiti\src\app\App.test.tsx` | Ujian | 4170 | `df8d66542752dfb8a8c247cfb69ba3f01530e88f64192a47af15db028fa0cdd5` | Kandungan/struktur diperiksa |
| 172 | `apps\portal-universiti\src\app\App.tsx` | Source/kontrak | 2339 | `3ed46af56eae9a0a2f636c5eb7e2c650174bcf8fe31f0154aa393b7c0b70f61a` | Kandungan/struktur diperiksa |
| 173 | `apps\portal-universiti\src\components\AcademicRecordForm.tsx` | Source/kontrak | 2516 | `3f813f9c54522fed8319c4333b35ca4ac5b8feb93adc2e9d9fd9a15fe7b9aa09` | Kandungan/struktur diperiksa |
| 174 | `apps\portal-universiti\src\components\AppFrame.tsx` | Source/kontrak | 2569 | `8a3fb2536cd2ce38d8cce27b1b7f8827c64a867c496103bf7c0a89209b70a426` | Kandungan/struktur diperiksa |
| 175 | `apps\portal-universiti\src\components\CareerProgressionDashboard.tsx` | Source/kontrak | 2581 | `75cf163b9a9a0b63907bd3fdceefacd97ee0f6c61049cbf9131aec66b510674a` | Kandungan/struktur diperiksa |
| 176 | `apps\portal-universiti\src\components\CustomSalaryTooltip.tsx` | Source/kontrak | 609 | `9263f6daa65d7dd8961f9960027ed5205ae640edd2e508025acd12a04404e0e4` | Kandungan/struktur diperiksa |
| 177 | `apps\portal-universiti\src\components\LocationMap.tsx` | Source/kontrak | 1695 | `81fd53c46969a20809993a4ef475cfb6e2d9a274f89f5563f9bc60af3448933b` | Kandungan/struktur diperiksa |
| 178 | `apps\portal-universiti\src\components\MockUniversityLogo.tsx` | Source/kontrak | 652 | `120f84313f09a78105dc858f1bcf3a53d0bec467f9eabdb97a0a092d51017199` | Kandungan/struktur diperiksa |
| 179 | `apps\portal-universiti\src\components\ParentAuthGate.tsx` | Source/kontrak | 3219 | `b84b43f4ba5efa239051748b7af79e3fc651230b1b305fda45dfa82485e65638` | Kandungan/struktur diperiksa |
| 180 | `apps\portal-universiti\src\components\ParentSessionGate.test.tsx` | Ujian | 1741 | `1abf66f9ac4750567286488edbf3477e6548e0a247de8596efa0c2b0074f8b80` | Kandungan/struktur diperiksa |
| 181 | `apps\portal-universiti\src\components\ParentSessionGate.tsx` | Source/kontrak | 2229 | `8d32bc17fb8b6a9cf30eb7dd86dd6863a487c4ac03127c17a5714780db1a4fd0` | Kandungan/struktur diperiksa |
| 182 | `apps\portal-universiti\src\components\PdfReportDialog.tsx` | Source/kontrak | 5289 | `9f4cb174cef4f8b95adb78e8e93f6242d1eb846632251cec2af30a1a8bfb8134` | Kandungan/struktur diperiksa |
| 183 | `apps\portal-universiti\src\components\PersonalityTest.tsx` | Source/kontrak | 2778 | `cc967af31e463b0fe8f5fb41bdfcc53de39b2bf5a7b9248d225c294c3d3cfec2` | Kandungan/struktur diperiksa |
| 184 | `apps\portal-universiti\src\components\ROICalculator.tsx` | Source/kontrak | 3089 | `233a4a579b644a6d2c3549ef337a2620b0a192025103f7341ded0abf007769da` | Kandungan/struktur diperiksa |
| 185 | `apps\portal-universiti\src\components\StudentAuthGate.tsx` | Source/kontrak | 4314 | `36e42ea1db1ce8a2d02f4934a4b58922c97f30eeda0a370d7651d30c1565064d` | Kandungan/struktur diperiksa |
| 186 | `apps\portal-universiti\src\components\VibeCheckQuiz.tsx` | Source/kontrak | 4017 | `953df75bba01b68f70ebb8b47619bd69f0b7c546ec84090c6ee8ab3df8eb9df7` | Kandungan/struktur diperiksa |
| 187 | `apps\portal-universiti\src\lib\assessment-data.ts` | Source/kontrak | 6410 | `290a08cd9e21571277ea7e6187b04a09a24ce2f5f3d291b87a8a4790cf218e40` | Kandungan/struktur diperiksa |
| 188 | `apps\portal-universiti\src\lib\auth-draft.test.ts` | Ujian | 3053 | `4d2c4f7a24e40e14dfd4c020a322ff1ba87ebe6b19f27250647e3d01ae760b39` | Kandungan/struktur diperiksa |
| 189 | `apps\portal-universiti\src\lib\auth-draft.ts` | Source/kontrak | 2710 | `992d0a98c75cae72faca813175cbbcbf5d30f8ee526d1f41b163336d615d06e0` | Kandungan/struktur diperiksa |
| 190 | `apps\portal-universiti\src\lib\auth-flow.test.ts` | Ujian | 3704 | `f9ed91cd1809ea27fc978df75f31aa80ac37c4f2bdd7f519d8581c2c8ead8fe4` | Kandungan/struktur diperiksa |
| 191 | `apps\portal-universiti\src\lib\auth-flow.ts` | Source/kontrak | 2025 | `515bcb830808952c5b083d702f5cd694723cc78e3939c47329c18f660891eeb7` | Kandungan/struktur diperiksa |
| 192 | `apps\portal-universiti\src\lib\database-payloads.test.ts` | Ujian | 3172 | `d3026cbf9e743b4c58870baed5f3c62bd6be4f8f1b9b15203d94081d7a2f94e5` | Kandungan/struktur diperiksa |
| 193 | `apps\portal-universiti\src\lib\database-payloads.ts` | Source/kontrak | 2333 | `32a65d843116aa606677342582dcf48a03abb045b30e7b8932a59d744c825694` | Kandungan/struktur diperiksa |
| 194 | `apps\portal-universiti\src\lib\portal-data.ts` | Source/kontrak | 8292 | `ee54f7b675b1477aa3c730534cd6663082fdc9c768d51d4370c824c3fe475ef9` | Kandungan/struktur diperiksa |
| 195 | `apps\portal-universiti\src\lib\portal.test.ts` | Ujian | 3080 | `9b98c17944db7532dfbbc8a4f2ba1e8f52dc01b8377be8b942ffa3a13a137052` | Kandungan/struktur diperiksa |
| 196 | `apps\portal-universiti\src\lib\recommendations.test.ts` | Ujian | 1098 | `8cc4fb4dbb482c0223b677fe474e500a3863e470403d9eadd0e5d6608cf76dd3` | Kandungan/struktur diperiksa |
| 197 | `apps\portal-universiti\src\lib\recommendations.ts` | Source/kontrak | 3359 | `2f84fc246f96f9689f50d61ff8893f2d24f4c57cff932281d3976dd837f5d935` | Kandungan/struktur diperiksa |
| 198 | `apps\portal-universiti\src\lib\storage.ts` | Source/kontrak | 3080 | `6da1e287079b39ee1a9144399a7d2d6a06054253974c3c19b5b2911e071e4617` | Kandungan/struktur diperiksa |
| 199 | `apps\portal-universiti\src\lib\validation.ts` | Source/kontrak | 4133 | `2a7466fa71626f027cae0e54b6b2c653b5a05bc06b9fc8000f32adb4883c3535` | Kandungan/struktur diperiksa |
| 200 | `apps\portal-universiti\src\main.tsx` | Source/kontrak | 335 | `de09d67248bb14672e1c7543f711ff9ddd88a2730c4138bb11ebdca81c752ac0` | Kandungan/struktur diperiksa |
| 201 | `apps\portal-universiti\src\routes\AuthCallback.test.tsx` | Ujian | 1872 | `384b131e536f1e3736ebf1625b1ebe27da4a518d65274fac26df90f3497d8aeb` | Kandungan/struktur diperiksa |
| 202 | `apps\portal-universiti\src\routes\AuthCallback.tsx` | Source/kontrak | 3383 | `260b9807036992470d7243b51a653e33809b4b26fa7e17d4d1628d7d17690363` | Kandungan/struktur diperiksa |
| 203 | `apps\portal-universiti\src\routes\Checkout.test.tsx` | Ujian | 3714 | `472ec71d4da89fbf215930b62669c1c27f1976ac72f7aca2e4324a76a582901e` | Kandungan/struktur diperiksa |
| 204 | `apps\portal-universiti\src\routes\Checkout.tsx` | Source/kontrak | 3854 | `d0580431a7ad856b46449ef697864ba737d0da181ae264a740d5e0e49ad2c9bc` | Kandungan/struktur diperiksa |
| 205 | `apps\portal-universiti\src\routes\EmailNotification.test.tsx` | Ujian | 1387 | `e456bb668db02780c2b6b893726689cf6ea39f8c804ae87291757b9d92a12672` | Kandungan/struktur diperiksa |
| 206 | `apps\portal-universiti\src\routes\EmailNotification.tsx` | Source/kontrak | 3127 | `aba03d88430da0b3568cc373fb3517d3e36f00a203ef83235cf8abcf62307f2f` | Kandungan/struktur diperiksa |
| 207 | `apps\portal-universiti\src\routes\ParentHandoff.test.tsx` | Ujian | 1167 | `c03b3291b5554750ba19c02bca69faf54b1c6342e1d2eba31ee92378f6a3e1e2` | Kandungan/struktur diperiksa |
| 208 | `apps\portal-universiti\src\routes\ParentHandoff.tsx` | Source/kontrak | 2144 | `fead4524380cf5b8c9ab7148436b429701fb9db5c15f6ad350330ea24e97cede` | Kandungan/struktur diperiksa |
| 209 | `apps\portal-universiti\src\routes\ParentPortal.tsx` | Source/kontrak | 14324 | `257dd96656cdb51fddc1687fafec7279e9d18c8bb812ac2346dfe22b7b63371c` | Kandungan/struktur diperiksa |
| 210 | `apps\portal-universiti\src\routes\Results.tsx` | Source/kontrak | 6294 | `1cba026d2a0b46168ceed0e02970ce14e2318a917b58ca1f9142d4bfe268c275` | Kandungan/struktur diperiksa |
| 211 | `apps\portal-universiti\src\routes\ScholarshipGuide.tsx` | Source/kontrak | 5150 | `b5f34035e1e4b21da342c0e095accf24fab66da5af217fb55dc41bc037219409` | Kandungan/struktur diperiksa |
| 212 | `apps\portal-universiti\src\routes\StudentPortal.test.tsx` | Ujian | 6496 | `75b0115dc79961e02c27d6008434fa0d2e396f6db24eedec25e3983abffb6d0f` | Kandungan/struktur diperiksa |
| 213 | `apps\portal-universiti\src\routes\StudentPortal.tsx` | Source/kontrak | 13322 | `d247ab5181563450c68b23c7244e0fa38aff79378c2bdd6e5ad11255aa81a9b9` | Kandungan/struktur diperiksa |
| 214 | `apps\portal-universiti\src\styles.css` | Source/kontrak | 1592 | `9709543190f7e380238d0119da6bec51213fb363e3188a9d5a0290dcba2dd4d7` | Kandungan/struktur diperiksa |
| 215 | `apps\portal-universiti\src\test\setup.ts` | Source/kontrak | 360 | `3844fc970ae72dc165e396b2d1108ea459a526c37f2dff3d69358c65d3855a37` | Kandungan/struktur diperiksa |
| 216 | `apps\portal-universiti\tsconfig.app.json` | Konfigurasi/metadata | 293 | `03d7cbba3aa73d90570f18c3d91f2bf048434ada69cce2f047173ae49c0ddd0a` | Kandungan/struktur diperiksa |
| 217 | `apps\portal-universiti\tsconfig.app.tsbuildinfo` | Generated build | 154120 | `ef38d48ffa3f072f57730cdf8bfb883ea023a131895deb5d6cae842eee571f8e` | Generated; struktur/hash diambil, source asal diutamakan |
| 218 | `apps\portal-universiti\tsconfig.json` | Konfigurasi/metadata | 119 | `770b4140bbb581e2dfd9ea9946ffc9c75a1d86ba7d2db5f77c83e37cbdf9d808` | Kandungan/struktur diperiksa |
| 219 | `apps\portal-universiti\tsconfig.node.json` | Konfigurasi/metadata | 229 | `11f3a584f509197f004bdd4700172443f10e64f3bf89f459b139170d839629ef` | Kandungan/struktur diperiksa |
| 220 | `apps\portal-universiti\tsconfig.node.tsbuildinfo` | Generated build | 57894 | `1842bda6b99be86d2d668568a36c4563659d53707525d7357dfed3ebf58b6de4` | Generated; struktur/hash diambil, source asal diutamakan |
| 221 | `apps\portal-universiti\vite.config.ts` | Source/kontrak | 973 | `94284d30000e8fdd7f71ff2ce5d3b1d5771849768dfec85f05c4cf4cd628589b` | Kandungan/struktur diperiksa |
| 222 | `docs\legal\DATA_COLLECTION_AUDIT.md` | Dokumentasi/blueprint | 6271 | `b628e2362dc14d83718c12780b8de724dda50da7e064cce3ef74c6794f7463dd` | Kandungan/struktur diperiksa |
| 223 | `docs\legal\LAUNCH_COMPLIANCE_CHECKLIST.md` | Dokumentasi/blueprint | 11846 | `477a3702a174d19b70e3a53573d419028f354c95b28b0fa9c0b8e957aaf75fe7` | Kandungan/struktur diperiksa |
| 224 | `docs\legal\PRIVACY_POLICY.md` | Dokumentasi/blueprint | 25638 | `22f4d1041abc5e49a7445ad010d3f87b24cf740dc6ac34d669955b204ed98f82` | Kandungan/struktur diperiksa |
| 225 | `docs\legal\TERMS_AND_CONDITIONS.md` | Dokumentasi/blueprint | 22388 | `6ba7686609e4f11f6d72d06ed6c018656cca14b037a1352bf19924cba39b788f` | Kandungan/struktur diperiksa |
| 226 | `docs\PRD_CURRENT_PLATFORM.md` | Dokumentasi/blueprint | 37964 | `e79fb6ef5c6a9804c3ec28fd0afa00e8669c4930a11efb9d88b88ed78f8439ae` | Kandungan/struktur diperiksa |
| 227 | `docs\release\STAGING_RELEASE_RUNBOOK.md` | Dokumentasi/blueprint | 13917 | `d00f42e112690fa4a4437a034fcf41b4c8f07dccdd28fc683fab06a4d886b6ad` | Kandungan/struktur diperiksa |
| 228 | `git push` | Konfigurasi/metadata | 4272 | `669a07965e902c3544931154a8f6ccb017ea5db5c13db5831d45b163a8055d48` | Kandungan/struktur diperiksa |
| 229 | `output\assurance\browser_cli_smoke.ps1` | Konfigurasi/metadata | 3621 | `eeecfd4b426ce412679aa8b0ca849871a4f4addfc917371b0ae69f6d686dfa63` | Kandungan/struktur diperiksa |
| 230 | `output\assurance\browser_recon.py` | Konfigurasi/metadata | 1431 | `64da1c2ce1b442a8b97efeb969f702fc7a8053fdbfbf809eaa3f65212c3390d7` | Kandungan/struktur diperiksa |
| 231 | `output\assurance\browser_smoke_bounded.ps1` | Konfigurasi/metadata | 2189 | `280a5d2322f0a9966d66ac4e610b2c27bdd48c0c47bb2bec143d93f98d397d29` | Kandungan/struktur diperiksa |
| 232 | `output\playwright\assurance\bounded-parent-desktop.png` | Aset/binari | 182418 | `936e440d6f3a7ea4466d868ce788326545b86b7046278527948bc5f05c538cd7` | Metadata + pemeriksaan visual wakil set |
| 233 | `output\playwright\assurance\bounded-student-login.png` | Aset/binari | 79290 | `3eda4450fb3c45ef4a26a716887ab8bfa452b9b26352f350a627a91baecb389e` | Metadata + pemeriksaan visual wakil set |
| 234 | `output\playwright\assurance\bounded-universiti-desktop.png` | Aset/binari | 160051 | `4caca9d858797c5ec04668a8366a901339822c7768f6de03972c03fa19cec4f9` | Metadata + pemeriksaan visual wakil set |
| 235 | `output\playwright\assurance\cli.config.json` | Konfigurasi/metadata | 326 | `a3a3a62cfe55258fec4f8946f981054b0bfe1918e1b268e843cb6b2aa7c85930` | Kandungan/struktur diperiksa |
| 236 | `output\playwright\assurance\parent-desktop.png` | Aset/binari | 182418 | `936e440d6f3a7ea4466d868ce788326545b86b7046278527948bc5f05c538cd7` | Metadata + pemeriksaan visual wakil set |
| 237 | `output\playwright\assurance\parent-mobile.png` | Aset/binari | 156797 | `a1e6adbec4aab5823e1229e30321bf623020dbae6a76af892208c3526897e2d2` | Metadata + pemeriksaan visual wakil set |
| 238 | `output\playwright\assurance\student-dashboard-desktop.png` | Aset/binari | 124650 | `fa47e27cf8c9d9f48a910c2a72a65f84a504db9ecc510efc077680a8d10b2eab` | Metadata + pemeriksaan visual wakil set |
| 239 | `output\playwright\assurance\student-dashboard-mobile.png` | Aset/binari | 105223 | `0c21621c162c2af538f190bada5481d92bf24a730f9d67bb2809515010e0defd` | Metadata + pemeriksaan visual wakil set |
| 240 | `output\playwright\assurance\student-login-desktop.png` | Aset/binari | 79290 | `3eda4450fb3c45ef4a26a716887ab8bfa452b9b26352f350a627a91baecb389e` | Metadata + pemeriksaan visual wakil set |
| 241 | `output\playwright\assurance\universiti-desktop.png` | Aset/binari | 159944 | `5cb19ed6378fa095ca41246a226c30ae4fa6b8adab6a0f4d8d3c3cf86a88aeac` | Metadata + pemeriksaan visual wakil set |
| 242 | `output\playwright\assurance\universiti-mobile.png` | Aset/binari | 143245 | `afec649a3552b56338c9c0cf7df3e3b3d8a19c686e8736b2145784b4ad6e36b8` | Metadata + pemeriksaan visual wakil set |
| 243 | `output\playwright\student\cli.config.json` | Konfigurasi/metadata | 327 | `e72114dccb9b7dc76baeb56f287b58fb8241adfbbcbe3eae5c78272af0e78eb7` | Kandungan/struktur diperiksa |
| 244 | `output\playwright\student\dashboard-desktop.png` | Aset/binari | 109845 | `c2bfe88d417ce9cfb971e2bb253abe9246d59fee780ec3f8f5e25a259a7d31d6` | Metadata + pemeriksaan visual wakil set |
| 245 | `output\playwright\student\dashboard-mobile-sticky.png` | Aset/binari | 24792 | `0a55fbc56769d1c6d03b477b64f0bfc0c8a2c9767da4e934410827bd2831d811` | Metadata + pemeriksaan visual wakil set |
| 246 | `output\playwright\student\dashboard-mobile-viewport.png` | Aset/binari | 32283 | `f12e0ecc418ef8a4f757a413e2f9e31a6349db1bfc0057196b0e51c892cd41c9` | Metadata + pemeriksaan visual wakil set |
| 247 | `output\playwright\student\dashboard-mobile.png` | Aset/binari | 93798 | `3e537cfd22a4e0a3fea7451a534277ef7f7e2196c7e31912641fff4e4bb11153` | Metadata + pemeriksaan visual wakil set |
| 248 | `output\playwright\student\login-desktop.png` | Aset/binari | 63800 | `acd3817012d19d0070e9c65ae7bfce58f721f9cb60b003f925822fff9d23ef6b` | Metadata + pemeriksaan visual wakil set |
| 249 | `package.json` | Konfigurasi/metadata | 565 | `f80dac5b74c7c883fa7e1ff57243948ff43f80f5b747899fb6d8f23241bb1998` | Kandungan/struktur diperiksa |
| 250 | `packages\database\.env.integration.local` | Environment (nilai dirahsiakan) | 888 | `3ad57f40a2a17bc091a720ef5008ae8ac2da3868e503a538c0df11f24c6496c9` | Nama key diperiksa; nilai tidak disalin |
| 251 | `packages\database\admin-check-hardening.contract.test.ts` | Ujian | 804 | `9bdb5e95a566e7e3e2280776acfd86f61e30e1f67410d738b15b0153cd4f096a` | Kandungan/struktur diperiksa |
| 252 | `packages\database\audit-flow.contract.test.ts` | Ujian | 1725 | `e1698fcdb2b8ef83ade16866d2ff77c5a2abdb8b86c13c0a8694cf61b7acd51d` | Kandungan/struktur diperiksa |
| 253 | `packages\database\audit-flow.fixtures.ts` | Source/kontrak | 8509 | `b1aae74c1a1f11ff310ef7ff4fa2a140486d9b2417aadc083410be8487274daf` | Kandungan/struktur diperiksa |
| 254 | `packages\database\audit-flow.test.ts` | Ujian | 20063 | `5f93dda09c00b18e42da4bbdc28c40932a7d2617125a285b687b482034d2c3c4` | Kandungan/struktur diperiksa |
| 255 | `packages\database\dist\index.d.ts` | Generated build | 1530 | `984ffd64cfe3b3c4dee625296566c80c15d432281e5d523ec0ecd8f71cda090a` | Generated; struktur/hash diambil, source asal diutamakan |
| 256 | `packages\database\dist\index.d.ts.map` | Generated build | 1062 | `99466bfb4154a4b777efc794a2e155bbceac9dbfed81382a87af956c3487bd53` | Generated; struktur/hash diambil, source asal diutamakan |
| 257 | `packages\database\dist\index.js` | Generated build | 196 | `1dd821b7684994ae5b6d196555d848484deb00e7058f97010a51ffc5c2dfcb13` | Generated; struktur/hash diambil, source asal diutamakan |
| 258 | `packages\database\dist\index.js.map` | Generated build | 219 | `6bb82deb25dfe864e7d7d8845864acada400899c7fae84bfa03a3d8dc5f88866` | Generated; struktur/hash diambil, source asal diutamakan |
| 259 | `packages\database\dist\supabase.d.ts` | Generated build | 1092 | `15b01f8300da64265698026ed7d6dc6b0f2f0a572bb8ad555e9872f7994fcf3f` | Generated; struktur/hash diambil, source asal diutamakan |
| 260 | `packages\database\dist\supabase.d.ts.map` | Generated build | 693 | `55c9086992bea7f17eb2c37c6c868e4f4d8eef8296cb60f8b1b681595aaa44e6` | Generated; struktur/hash diambil, source asal diutamakan |
| 261 | `packages\database\dist\supabase.js` | Generated build | 2733 | `4dae4bd26c6985b05f7227fa67e57e7f38a9e5f4b1f196bca50ccc2f529b046b` | Generated; struktur/hash diambil, source asal diutamakan |
| 262 | `packages\database\dist\supabase.js.map` | Generated build | 2139 | `7636b7403c01b56f75134a0891cabcb62a9775230964f8ebbb76e542a7653ed2` | Generated; struktur/hash diambil, source asal diutamakan |
| 263 | `packages\database\dist\types.d.ts` | Generated build | 26335 | `34be2684dd92524092b818bbf67f53bb65d7adc9bd7ea71edae0df33f6e1604e` | Generated; struktur/hash diambil, source asal diutamakan |
| 264 | `packages\database\dist\types.d.ts.map` | Generated build | 18290 | `4ec1322320f00279713b17b1ea98522c52c4f93354daeef7e8bd925858cabc8f` | Generated; struktur/hash diambil, source asal diutamakan |
| 265 | `packages\database\dist\types.js` | Generated build | 1966 | `7e0c11110c46348a461dfd94a833a8b07ffde9f198443ea47841ae26dff2e39b` | Generated; struktur/hash diambil, source asal diutamakan |
| 266 | `packages\database\dist\types.js.map` | Generated build | 1529 | `f6059a3a2ad88cc2e5c58412238f5d620e1766ed224f4ee3fecefc6d15a4ae63` | Generated; struktur/hash diambil, source asal diutamakan |
| 267 | `packages\database\index.ts` | Source/kontrak | 1642 | `4f6503239ac25b573ef9f9b998002cd94cbe8bdb13c0c7419742d6f51efabfa3` | Kandungan/struktur diperiksa |
| 268 | `packages\database\integration.env.example` | Environment (nilai dirahsiakan) | 485 | `fc394c866fd1a2323a630dd6dcc09bdb3f9652733d935ccb0760c9e1d9d3656b` | Nama key diperiksa; nilai tidak disalin |
| 269 | `packages\database\package.json` | Konfigurasi/metadata | 966 | `2e629b6d25c4442d24267af80595ef22d5be41f4b5cb3276a9406e29db451c87` | Kandungan/struktur diperiksa |
| 270 | `packages\database\README.md` | Dokumentasi/blueprint | 4119 | `b5ab9f3b5299eef1287757f2af3445c1ed8bb64a8c600effc2e6738ae2115b74` | Kandungan/struktur diperiksa |
| 271 | `packages\database\review-rate-limit.contract.test.ts` | Ujian | 873 | `977dcc1017a1e6b14f8b068c0dddde92a3f8dbbd1a79ac244b1319d214fee2e0` | Kandungan/struktur diperiksa |
| 272 | `packages\database\schema-shape.test.ts` | Ujian | 6739 | `a18b1938588664307184557c60163be09760e43328781ff83c761545554ea686` | Kandungan/struktur diperiksa |
| 273 | `packages\database\security-hardening.contract.test.ts` | Ujian | 1109 | `62f1b44b97f2fe0458dd7e4c14ad00ff66c4051b442eb2b968a86370d51e8d71` | Kandungan/struktur diperiksa |
| 274 | `packages\database\supabase.test.ts` | Ujian | 2495 | `ff1637eefffeb02a82faaf71bd8ee8304bda4c43051b3ef5442beacadad4ed65` | Kandungan/struktur diperiksa |
| 275 | `packages\database\supabase.ts` | Source/kontrak | 3123 | `70000ef7a3248e6a7b305cde6a9d06ed8b0274563edfb46d8c6d0effd4628376` | Kandungan/struktur diperiksa |
| 276 | `packages\database\tsconfig.build.json` | Konfigurasi/metadata | 442 | `d0bad2ae96b1bb1442975697737325cda8a8ded2427e005ee18ba5dd5282c808` | Kandungan/struktur diperiksa |
| 277 | `packages\database\tsconfig.integration.json` | Konfigurasi/metadata | 480 | `f5f336cf1d2c327f34fe25ee2b1526f119643c6f007ff0f1b8dc5f99014a03af` | Kandungan/struktur diperiksa |
| 278 | `packages\database\tsconfig.json` | Konfigurasi/metadata | 331 | `65e3918572adea019972d2db5732de22ade468076308699a66b506ca60b30ab6` | Kandungan/struktur diperiksa |
| 279 | `packages\database\types.contract.test.ts` | Ujian | 6145 | `a931b3f0ed74e663cae6e8642be05bbba43ec1974747fa5957c58e7d47afa3de` | Kandungan/struktur diperiksa |
| 280 | `packages\database\types.ts` | Source/kontrak | 21972 | `eaa6f2807e23132760fc7a7f70edfccf50fb0fd77530c96eb64a315459b96a23` | Kandungan/struktur diperiksa |
| 281 | `packages\database\vitest.config.mjs` | Source/kontrak | 313 | `c0c6c6770676bd4da999a6856774e949f4c18f98cc9e3bb1d694c4d529bff7e9` | Kandungan/struktur diperiksa |
| 282 | `packages\database\vitest.integration.config.ts` | Source/kontrak | 692 | `e19c5c91f9120c9f01c6989730ffaaa3a94c8173fa970d8b52b2e6e69e33edec` | Kandungan/struktur diperiksa |
| 283 | `packages\database\vitest.integration.setup.ts` | Source/kontrak | 682 | `b0cf28bf22b49ec1d84d1921d9634c6073fddacc4815d3af979b804be63784ff` | Kandungan/struktur diperiksa |
| 284 | `packages\database\vitest.setup.ts` | Source/kontrak | 131 | `8b31a71abfbeec7155b92e7ba3855835268c1ca397626bb19299b5f645d2fcb4` | Kandungan/struktur diperiksa |
| 285 | `packages\ui\dist\CookieConsent.d.ts` | Generated build | 186 | `ebb904c31daa5fa138b4049f87e32b35618ca966248bbda37903a7b3fd8b6ee5` | Generated; struktur/hash diambil, source asal diutamakan |
| 286 | `packages\ui\dist\CookieConsent.d.ts.map` | Generated build | 180 | `b07972854dab0c5013fa785b105c2ae3c7b36282a1957bf82fffaa0e8b82a108` | Generated; struktur/hash diambil, source asal diutamakan |
| 287 | `packages\ui\dist\CookieConsent.js` | Generated build | 3382 | `bfd84834dee1fe18b586774379800d87038470a4f9223e75d87dcc4e42c40ace` | Generated; struktur/hash diambil, source asal diutamakan |
| 288 | `packages\ui\dist\CookieConsent.js.map` | Generated build | 1879 | `5a2d2b8c5b30216f9234ad561764480d842debfb200d0ed3fdad8ca88ce7fb14` | Generated; struktur/hash diambil, source asal diutamakan |
| 289 | `packages\ui\dist\index.d.ts` | Generated build | 107 | `c7b402712d14e205c3acf2aceece9b2a4110760c2efbe047810b2d0ed09b9921` | Generated; struktur/hash diambil, source asal diutamakan |
| 290 | `packages\ui\dist\index.d.ts.map` | Generated build | 157 | `15b4221ab37d3d4e7351fef26f828e6293f4b49b4fb690357e2f88603d0bf3d9` | Generated; struktur/hash diambil, source asal diutamakan |
| 291 | `packages\ui\dist\index.js` | Generated build | 105 | `1ea09c5ca0bc4dd014aacecc2422df7ee3aa2794c4e3389210305d2469d85bcb` | Generated; struktur/hash diambil, source asal diutamakan |
| 292 | `packages\ui\dist\index.js.map` | Generated build | 155 | `c9efec31a31f2522787be295c69ca8fcd8c5a446b58fd9662eac3e5964f70999` | Generated; struktur/hash diambil, source asal diutamakan |
| 293 | `packages\ui\package.json` | Konfigurasi/metadata | 983 | `e891eacf10ddf8f31a0fccf5bc5076c65051fa6781f848d31dc5582ece68c2fc` | Kandungan/struktur diperiksa |
| 294 | `packages\ui\README.md` | Dokumentasi/blueprint | 877 | `4c6eaf46819153d5b8acfa340568af843505166bd9e8671428d4019b766e6817` | Kandungan/struktur diperiksa |
| 295 | `packages\ui\src\CookieConsent.test.tsx` | Ujian | 3951 | `15fa42d741a8b116ce7f68b53450dba59083d3c00b45ca3d13ab3b9fb0698fae` | Kandungan/struktur diperiksa |
| 296 | `packages\ui\src\CookieConsent.tsx` | Source/kontrak | 3524 | `c2a4bafc6d969469be84bdb6e3041ecd496642d2f0314d80a9bb4d01d63f5282` | Kandungan/struktur diperiksa |
| 297 | `packages\ui\src\index.ts` | Source/kontrak | 72 | `24c3a1d3daff1a40c1558c685fa84eeb6f01c34b6582cd20f3ad04ab6c6d4594` | Kandungan/struktur diperiksa |
| 298 | `packages\ui\tsconfig.build.json` | Konfigurasi/metadata | 309 | `883485ca19ba4d76b7f62647068f1851631ff2486527bd56cc2cfa59cff02d7b` | Kandungan/struktur diperiksa |
| 299 | `packages\ui\tsconfig.json` | Konfigurasi/metadata | 294 | `d6437017c388d0f1741f0a709a570300cd64691aaa7fc9f9f4dd460ff72caca6` | Kandungan/struktur diperiksa |
| 300 | `packages\ui\vitest.config.ts` | Source/kontrak | 242 | `6138c9bc10503fa8f0d656cc84892573cf81b9a8fda82ee57971cda15e5d694a` | Kandungan/struktur diperiksa |
| 301 | `packages\ui\vitest.setup.ts` | Source/kontrak | 43 | `9b328c4843431fa76d8de00008fc159e95f99a840211085ff3b8f25e53d14409` | Kandungan/struktur diperiksa |
| 302 | `phase by phase.md` | Dokumentasi/blueprint | 16825 | `8603a13e07b387a6034c180f2d81fe09240b402c31a9d4bde45377780691f495` | Kandungan/struktur diperiksa |
| 303 | `pnpm-lock.yaml` | Konfigurasi/metadata | 124743 | `319f4cf09adfe82e6680f5c276eba9adf714b1bb144e2080c988292f22716f28` | Kandungan/struktur diperiksa |
| 304 | `pnpm-workspace.yaml` | Konfigurasi/metadata | 102 | `22d3a307f3b6534364e2a8fd407188595b7db65ad0da007019f46e5050a4bac0` | Kandungan/struktur diperiksa |
| 305 | `README.md` | Dokumentasi/blueprint | 2395 | `ef930c922ddbae13d8e47beefa758af2ab2b359a857df6b920715dfbe2db54c6` | Kandungan/struktur diperiksa |
| 306 | `SKILL.md` | Dokumentasi/blueprint | 6233 | `29171cfccc139c0ee66c1a0fe305c04d6bba8d0ea6d1a5a187a81f565e4bf255` | Kandungan/struktur diperiksa |
| 307 | `supabase\.gitignore` | Konfigurasi/metadata | 72 | `507699eb91144818edf61d3a079212cacf31d8db520eae428e3b48fcf0d6919c` | Kandungan/struktur diperiksa |
| 308 | `supabase\.temp\cli-latest` | Konfigurasi/metadata | 8 | `0daaac4eb443724f347b3d1df0dbacffb1e0755f345412d1f9032eb664aa9b18` | Kandungan/struktur diperiksa |
| 309 | `supabase\.temp\gotrue-version` | Konfigurasi/metadata | 8 | `f75a75b98e8dff9c488b13f4dcfe8d335b699fbe091d54f101ca7fd1b97ee68a` | Kandungan/struktur diperiksa |
| 310 | `supabase\.temp\linked-project.json` | Konfigurasi/metadata | 136 | `d38ff559001ef92448c8f50d21d480d430552ef446e4601866189b8c7c966513` | Kandungan/struktur diperiksa |
| 311 | `supabase\.temp\pgdelta\pgdelta-target-ca.crt` | Aset/binari | 4125 | `50a69ecbd3fe8efbb341d1148db9d672be0ce0397be679bf9c9b19de5fcdb139` | Kandungan/struktur diperiksa |
| 312 | `supabase\.temp\pooler-url` | Konfigurasi/metadata | 97 | `69a79f963d5c631540dd19ce7d47276df817c04ba927f7f05332d519e456eb52` | Kandungan/struktur diperiksa |
| 313 | `supabase\.temp\postgres-version` | Konfigurasi/metadata | 10 | `d955b10ac9c402ea85804848c4d73b31bab4f5c60c6a6766c3797d04cfc6b3ac` | Kandungan/struktur diperiksa |
| 314 | `supabase\.temp\project-ref` | Konfigurasi/metadata | 20 | `48f29c25ef53c108a41d2285138dbb72c5608aeb5f2518432954271c789d0158` | Kandungan/struktur diperiksa |
| 315 | `supabase\.temp\rest-version` | Konfigurasi/metadata | 5 | `b25de4a023eef82d4780a9f7816c5685ca35437308a9d457585eece9945485dc` | Kandungan/struktur diperiksa |
| 316 | `supabase\.temp\storage-migration` | Konfigurasi/metadata | 33 | `5eefa09f2bf47edfbd65e0307f2ebf6eec935a663b45e36cbd9395c3f10695d0` | Kandungan/struktur diperiksa |
| 317 | `supabase\.temp\storage-version` | Konfigurasi/metadata | 7 | `2413c9aa419634fb971140ec25bd16439ce3586c45af662e8efb7c2f30611a84` | Kandungan/struktur diperiksa |
| 318 | `supabase\config.toml` | Konfigurasi/metadata | 15731 | `265b4adb4c45b25f2378414a0cad4bdeb2e51c146173e42aab5c2d15cd859086` | Kandungan/struktur diperiksa |
| 319 | `supabase\migrations\20260714024203_initial_schema.sql` | Migration DB | 6444 | `022b313fb47e40e3237e5b419f77f82bd6fddda8b58bec1d427a959059abb9e1` | Kandungan/struktur diperiksa |
| 320 | `supabase\migrations\20260714050000_expand_portal_assessment_payloads.sql` | Migration DB | 4798 | `dc8c1ba26a79d7dcffcdfead651d3c40f4b7295bd576174360e1a0f5488ab9de` | Kandungan/struktur diperiksa |
| 321 | `supabase\migrations\20260717153000_university_management_assets.sql` | Migration DB | 5954 | `fa1529a773f3f3bcd9450883ed6b4c6c36922792ee6b5acfcc7c0f0861ea0642` | Kandungan/struktur diperiksa |
| 322 | `supabase\migrations\20260719231138_university_management_grants.sql` | Migration DB | 338 | `a949747ca4d89330cb0fd7f9d9742551ace098e06227697e156320ca22d41301` | Kandungan/struktur diperiksa |
| 323 | `supabase\migrations\20260726030008_session_student_bindings.sql` | Migration DB | 3544 | `ca904ae4f0ff9ed487c31e933184640f32cfddae9d015113f601fe6d62f53320` | Kandungan/struktur diperiksa |
| 324 | `supabase\migrations\20260726030217_trusted_invitation_operations.sql` | Migration DB | 13339 | `9fe6f3b903309f0cf057d9151c406f8be6d40cbc032366d0879ea4d8520de3af` | Kandungan/struktur diperiksa |
| 325 | `supabase\migrations\20260726030227_ownership_rls_policies.sql` | Migration DB | 8294 | `d6ee239aec398a6dda32f1174bf2ef47e4e08bd721b0022e05aa4162075f8e81` | Kandungan/struktur diperiksa |
| 326 | `supabase\migrations\20260726030238_security_hardening_profiles_reviews_storage.sql` | Migration DB | 11985 | `48d8e2f7921ddeac27605043fd3ecdbd13ea10eec434768cb7aa7faef5645c83` | Kandungan/struktur diperiksa |
| 327 | `supabase\migrations\20260726030646_harden_public_review_projection_and_storage.sql` | Migration DB | 5352 | `9644b3b407905df3135aa5ed5e03f06ac4e2eed3266ee5b9f93ec8cfe281ff3d` | Kandungan/struktur diperiksa |
| 328 | `supabase\migrations\20260726032653_move_admin_check_to_private_schema.sql` | Migration DB | 6560 | `02b902b16493445020ebd7fc4ffb038ee019b286c9251cd36d3165b3f1ab1a70` | Kandungan/struktur diperiksa |
| 329 | `supabase\migrations\20260726033011_rate_limit_public_review_submission.sql` | Migration DB | 3395 | `2f6c14d1e956fda14b4ba7b49e17323c59c73119800a27fe2cfab1066940a0c0` | Kandungan/struktur diperiksa |
| 330 | `supabase\migrations\20260729074956_grant_service_role_integration_audit.sql` | Migration DB | 842 | `ef55eb7d35257dd36944703a30f472b343cc4bf4d8fc76b470d11c350ded380a` | Kandungan/struktur diperiksa |
| 331 | `supabase\migrations\20260729075740_grant_service_role_audit_cleanup_filter_access.sql` | Migration DB | 297 | `300066be4f4fe7bc94819ad7ee7582ac624b6194a9dce2d5ec2b7b8938721bce` | Kandungan/struktur diperiksa |
| 332 | `supabase\rollback\20260714050000_expand_portal_assessment_payloads.down.sql` | Rollback DB | 937 | `a11ed1e80db9a50af13d59bfa16241f6b381f922d0fa23f450b4a7aa96ecda1f` | Kandungan/struktur diperiksa |
| 333 | `supabase\rollback\20260717153000_university_management_assets.down.sql` | Rollback DB | 239 | `1104dec39353acab1d2849b22492f1892e3b9d2e0f341faa22d85bf6153cc8e0` | Kandungan/struktur diperiksa |
| 334 | `supabase\rollback\20260719231138_university_management_grants.down.sql` | Rollback DB | 293 | `6ab278b1204ca83e25b4f4b7b191d268604aaec4756b5a65e20f3317eba56fca` | Kandungan/struktur diperiksa |
| 335 | `supabase\rollback\20260723090940_session_student_bindings.down.sql` | Rollback DB | 239 | `7864ce74028df939826a8451e5c3fd5f7047e58803cf87432b057037818ce7fa` | Kandungan/struktur diperiksa |
| 336 | `supabase\rollback\20260723092141_trusted_invitation_operations.down.sql` | Rollback DB | 250 | `cf5aba6f0f6d0441454a22ba49d09371ab617e909a731fe429bfc4056b7bb1f3` | Kandungan/struktur diperiksa |
| 337 | `supabase\rollback\20260723093327_ownership_rls_policies.down.sql` | Rollback DB | 244 | `6244f8c4d16a59626f7f5bf40e6574b637295220798aec805c139e087aa83eee` | Kandungan/struktur diperiksa |
| 338 | `supabase\rollback\20260723094551_security_hardening_profiles_reviews_storage.down.sql` | Rollback DB | 305 | `29202e0e3d27d204a0a71f1f81f246b2a5686396c3d443b40e6d474895955dc9` | Kandungan/struktur diperiksa |
| 339 | `supabase\tests\database\initial_schema.test.sql` | Ujian | 10178 | `631ab4f8fb4b3a9af1a27b41de1942cb3abc8f23bc83d44c72caec3b93e0c1f3` | Kandungan/struktur diperiksa |
| 340 | `supabase\tests\database\ownership_security.test.sql` | Ujian | 3552 | `0bebc5a5b7bfc0794db76aba56531c8e47c1f085964fcc334d127a15e4926d8b` | Kandungan/struktur diperiksa |
| 341 | `supabase\tests\database\portal_payloads.test.sql` | Ujian | 1130 | `ab258ee456584ba7ae5a88858c6873590c01209e966d7a581a19205462d2686d` | Kandungan/struktur diperiksa |
| 342 | `supabase\tests\database\session_student_bindings.test.sql` | Ujian | 10010 | `e9ff30882d3dcaf29765b3d23dc1df3a018c9cd4694db0f76662ddf91d136517` | Kandungan/struktur diperiksa |
| 343 | `supabase\tests\database\university_management.test.sql` | Ujian | 2553 | `c06f669272361d0606c689e7f422010699a3f158f509df495b5730777498c171` | Kandungan/struktur diperiksa |
| 344 | `tsconfig.base.json` | Konfigurasi/metadata | 481 | `dcd5d530a24bb004a432b35606d39a825fbfa4accc3486ec1e0959580570c4c4` | Kandungan/struktur diperiksa |
| 345 | `turbo.json` | Konfigurasi/metadata | 413 | `556f547095a5bafff4bff67142270502c2dbaba7df285551e4600667377a43b3` | Kandungan/struktur diperiksa |
